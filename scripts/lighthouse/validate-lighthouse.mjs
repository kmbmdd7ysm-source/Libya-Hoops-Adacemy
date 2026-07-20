import { readFile, writeFile } from 'node:fs/promises';

const modes = ['mobile', 'desktop'];
const rows = [];
for (const mode of modes) {
  let report;
  try {
    const html = await readFile(`reports/lighthouse-${mode}.html`, 'utf8');
    if (!html.includes('<html') || !html.includes('Lighthouse')) {
      throw new Error('HTML report is empty or invalid');
    }
    report = JSON.parse(await readFile(`reports/lighthouse-${mode}.json`, 'utf8'));
  } catch (error) {
    throw new Error(`Missing or malformed ${mode} Lighthouse JSON: ${error.message}`);
  }
  if (report.runtimeError)
    throw new Error(`${mode} Lighthouse runtime error: ${report.runtimeError.message}`);
  for (const key of ['performance', 'accessibility', 'best-practices', 'seo']) {
    const score = report.categories?.[key]?.score;
    if (score == null || !Number.isFinite(score) || score < 0 || score > 1)
      throw new Error(`${mode} Lighthouse ${key} score is null or invalid`);
  }
  if (!report.finalDisplayedUrl || !report.fetchTime || !report.lighthouseVersion)
    throw new Error(`${mode} Lighthouse report metadata is incomplete`);
  const metric = (id) => report.audits?.[id]?.displayValue ?? 'n/a';
  rows.push({
    mode,
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories['best-practices'].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    fcp: metric('first-contentful-paint'),
    lcp: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbt: metric('total-blocking-time'),
    speedIndex: metric('speed-index'),
    tti: metric('interactive'),
  });
}
const md = [
  '# Lighthouse Summary',
  '',
  '| Mode | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT | Speed Index | TTI |',
  '|---|---:|---:|---:|---:|---|---|---|---|---|---|',
  ...rows.map(
    (r) =>
      `| ${r.mode} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.seo} | ${r.fcp} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.speedIndex} | ${r.tti} |`,
  ),
  '',
];
await writeFile('reports/lighthouse-summary.md', md.join('\n'));
console.log(md.join('\n'));
