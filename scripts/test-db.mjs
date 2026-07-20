import { spawnSync } from 'node:child_process';

const cli = ['--yes', 'supabase@2.109.1'];
const run = (args, allowFailure = false) => {
  const result = spawnSync('npx', [...cli, ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (!allowFailure && result.status !== 0) process.exit(result.status || 1);
  return result.status === 0;
};

let started = false;
try {
  started = run(['start']);
  run(['db', 'reset']);
  run(['test', 'db']);
} finally {
  if (started) run(['stop', '--no-backup'], true);
}
