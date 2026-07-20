import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const external = process.env.PLAYWRIGHT_BASE_URL;
let server;
let stopping = false;
const diagnostics = [];
const log = (message) => {
  diagnostics.push(message);
  console.log(message);
};
const freePort = () =>
  new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.unref();
    socket.on('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const { port } = socket.address();
      socket.close(() => resolve(port));
    });
  });
const stop = async () => {
  if (stopping) return;
  stopping = true;
  if (server && !server.killed) {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (!server.killed) server.kill('SIGKILL');
        resolve();
      }, 3000);
      server.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
};
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    await stop();
    process.exit(130);
  });
const waitReady = async (url) => {
  let lastError;
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      const body = await response.text();
      if (response.ok && /<div id=["']root["']/.test(body)) return;
      lastError = new Error(`HTTP ${response.status}; expected application HTML`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Browser server readiness failed for ${url}: ${lastError?.message || 'unknown error'}`,
  );
};
let baseURL = external;
try {
  await mkdir('reports/browser-runner', { recursive: true });
  if (!baseURL) {
    const port = await freePort();
    baseURL = `http://127.0.0.1:${port}`;
    server = spawn(
      process.execPath,
      [
        './node_modules/vite/bin/vite.js',
        'preview',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--strictPort',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'], env: process.env },
    );
    server.stdout.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`));
    server.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));
  }
  log(`Browser target: ${baseURL}${external ? ' (external)' : ' (local dynamic port)'}`);
  await waitReady(baseURL);
  log('Server readiness check passed.');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 10_000 });
    log('Chromium launch and navigation diagnostic passed.');
  } finally {
    await browser.close();
  }
  const child = spawn(
    process.execPath,
    ['./node_modules/@playwright/test/cli.js', 'test', ...args],
    { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BASE_URL: baseURL } },
  );
  const code = await new Promise((resolve) => child.once('exit', (value) => resolve(value ?? 1)));
  if (code !== 0)
    log(
      `Playwright exited with code ${code}. Inspect reports/playwright and reports/playwright-artifacts.`,
    );
  process.exitCode = code;
} catch (error) {
  log(`Browser execution unavailable or failed: ${error?.stack || error}`);
  process.exitCode = 1;
} finally {
  await writeFile('reports/browser-runner/last-run.txt', `${diagnostics.join('\n')}\n`);
  await stop();
}
