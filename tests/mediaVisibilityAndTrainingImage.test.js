import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

describe('catalogue media regression', () => {
  it('uses the correct lower-body image for LHA Leg Drive', () => {
    const data = read('src/data/onlineTraining.js');
    expect(data).toContain("slug:'full-week-legs'");
    expect(data).toMatch(/slug:'full-week-legs'[\s\S]*?coverImage:'\/images\/training\/full-week-legs\.jpg'/);
    expect(existsSync('public/images/training/full-week-legs.jpg')).toBe(true);
  });

  it.each([
    'src/components/programs/ProgramCard.jsx',
    'src/components/events/EventCard.jsx',
    'src/components/training/TrainingCard.jsx',
  ])('loads card media eagerly on desktop and mobile: %s', (file) => {
    expect(read(file)).toContain('eager');
  });
});
