import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import picomatch from 'picomatch';
import criticalConfig from '../vitest.critical.config.js';

const raw = JSON.parse(await readFile('coverage-critical/coverage-final.json', 'utf8'));
const configured = criticalConfig?.test?.coverage?.thresholds || {};
const metricNames = ['lines', 'functions', 'statements', 'branches'];
const globalThresholds = Object.fromEntries(metricNames.map((name) => [name, configured[name]]));
const globThresholds = Object.entries(configured).filter(
  ([key, value]) => !metricNames.includes(key) && typeof value === 'object',
);
const pct = (covered, total) => (total ? (covered / total) * 100 : 100);
const metric = (map) => {
  const values = Object.values(map || {});
  return { covered: values.filter((v) => v > 0).length, total: values.length };
};
const branchMetric = (map) => {
  const values = Object.values(map || {}).flat();
  return { covered: values.filter((v) => v > 0).length, total: values.length };
};
const thresholdsFor = (file) => {
  const specific = globThresholds.find(([glob]) => picomatch(glob)(file))?.[1] || {};
  return { ...globalThresholds, ...specific };
};
const rows = [];
for (const [absolute, data] of Object.entries(raw)) {
  const file = path.relative(process.cwd(), absolute).replaceAll('\\', '/');
  const s = metric(data.s),
    f = metric(data.f),
    b = branchMetric(data.b);
  const lines = new Map();
  for (const [id, count] of Object.entries(data.s || {})) {
    const line = data.statementMap?.[id]?.start?.line;
    if (line) lines.set(line, (lines.get(line) || 0) + count);
  }
  const l = { covered: [...lines.values()].filter((v) => v > 0).length, total: lines.size };
  const uncoveredLines = [...lines.entries()]
    .filter(([, count]) => count === 0)
    .map(([line]) => line);
  const uncoveredBranches = [];
  for (const [id, hits] of Object.entries(data.b || {}))
    hits.forEach((hit, index) => {
      if (hit === 0)
        uncoveredBranches.push(`${data.branchMap?.[id]?.loc?.start?.line ?? '?'}:${index}`);
    });
  const actual = {
    lines: pct(l.covered, l.total),
    statements: pct(s.covered, s.total),
    functions: pct(f.covered, f.total),
    branches: pct(b.covered, b.total),
  };
  const thresholds = thresholdsFor(file);
  const pass = metricNames.every((name) => actual[name] >= (thresholds[name] ?? 0));
  rows.push({ file, ...actual, thresholds, pass, uncoveredLines, uncoveredBranches });
}
rows.sort((a, b) => a.branches - b.branches || a.file.localeCompare(b.file));
const globalText = metricNames.map((n) => `${globalThresholds[n]}% ${n}`).join(', ');
const md = [
  '# Critical Coverage Summary',
  '',
  `Global thresholds from \`vitest.critical.config.js\`: ${globalText}. File-specific overrides below are read dynamically from the same active configuration.`,
  '',
  '| File | Thresholds L/F/S/B | Actual L/F/S/B | Result | Weakest branch | Uncovered lines | Uncovered branches |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r) => {
    const t = `${r.thresholds.lines}/${r.thresholds.functions}/${r.thresholds.statements}/${r.thresholds.branches}`;
    const a = `${r.lines.toFixed(2)}/${r.functions.toFixed(2)}/${r.statements.toFixed(2)}/${r.branches.toFixed(2)}`;
    return `| ${r.file} | ${t} | ${a} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.uncoveredBranches[0] || 'None'} | ${r.uncoveredLines.join(', ') || 'None'} | ${r.uncoveredBranches.join(', ') || 'None'} |`;
  }),
  '',
  '## Failures',
  '',
  ...(rows.filter((r) => !r.pass).map((r) => `- ${r.file}`).length
    ? rows.filter((r) => !r.pass).map((r) => `- ${r.file}`)
    : ['- None.']),
  '',
].join('\n');
await mkdir('reports', { recursive: true });
await writeFile('reports/coverage-critical-summary.md', md);
console.log(md);
if (rows.some((r) => !r.pass)) process.exitCode = 1;
