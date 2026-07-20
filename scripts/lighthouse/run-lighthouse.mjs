import { spawn } from 'node:child_process';
import net from 'node:net';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const mode = process.argv[2] || 'mobile';
if (!['mobile', 'desktop'].includes(mode)) throw new Error(`Unsupported Lighthouse mode: ${mode}`);
const externalUrl = process.env.LIGHTHOUSE_URL?.trim();
let server;
let chrome;
let stopping = false;

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
  if (chrome) {
    try {
      await chrome.kill();
    } catch {}
  }
  if (server && !server.killed) {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        server.kill('SIGKILL');
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
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `Lighthouse server readiness failed for ${url}: ${lastError?.message || 'unknown error'}`,
  );
};

await mkdir('reports', { recursive: true });
await Promise.all([
  rm(`reports/lighthouse-${mode}.html`, { force: true }),
  rm(`reports/lighthouse-${mode}.json`, { force: true }),
]);

let auditUrl = externalUrl;
try {
  if (!auditUrl) {
    const port = await freePort();
    auditUrl = `http://127.0.0.1:${port}`;
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
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      },
    );
    server.stdout.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`));
    server.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));
  }
  await waitReady(auditUrl);
  chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROMIUM_PATH || process.env.CHROME_PATH || '/usr/bin/chromium',
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  const result = await lighthouse(auditUrl, {
    port: chrome.port,
    output: ['html', 'json'],
    logLevel: process.env.LIGHTHOUSE_LOG_LEVEL || 'error',
    formFactor: mode,
    screenEmulation:
      mode === 'desktop'
        ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
        : undefined,
  });
  const lhr = result?.lhr;
  if (!lhr) throw new Error('Lighthouse returned no result');
  if (lhr.runtimeError)
    throw new Error(
      lhr.runtimeError.message || lhr.runtimeError.code || 'Lighthouse runtime failure',
    );
  if (
    /chrome-error:\/\//i.test(lhr.finalDisplayedUrl || '') ||
    /NO_NAVSTART/i.test(JSON.stringify(lhr.runtimeError || ''))
  ) {
    throw new Error(
      `Invalid Lighthouse navigation result: ${lhr.finalDisplayedUrl || 'unknown URL'}`,
    );
  }
  for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
    if (!Number.isFinite(lhr.categories?.[category]?.score))
      throw new Error(`Missing or null Lighthouse category: ${category}`);
  }
  const [html, json] = result.report;
  if (!html || !json) throw new Error('Lighthouse did not generate both HTML and JSON reports');
  await writeFile(`reports/lighthouse-${mode}.html`, html);
  await writeFile(`reports/lighthouse-${mode}.json`, json);
  console.log(`Fresh ${mode} Lighthouse reports generated for ${auditUrl}`);
} finally {
  await stop();
}
