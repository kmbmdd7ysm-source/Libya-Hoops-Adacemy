import { describe, expect, it } from 'vitest';
import { onlineTraining, suppliedTrainingPrograms } from '../src/data/onlineTraining.js';
import { trainingDurationIds, trainingGoal, matchesTraining, listedPrices } from '../src/data/trainingDiscovery.js';

const find = (slug) => onlineTraining.find((program) => program.slug === slug);

describe('online training uses exact source duration/price options', () => {
  it('maps only real multi-length options', () => {
    expect(trainingDurationIds(find('bodyweight-work'))).toEqual(['1m', '3m', '6m']);
    expect(listedPrices(find('bodyweight-work')).map((item) => item.price)).toEqual([15, 40, 65]);
    expect(trainingDurationIds(find('full-body-strength'))).toEqual(['1m', '3m', '6m']);
    expect(listedPrices(find('full-body-strength')).map((item) => item.price)).toEqual([20, 50, 100]);
    expect(trainingDurationIds(find('vert-code-elite'))).toEqual(['1m', '12m']);
    expect(listedPrices(find('vert-code-elite')).map((item) => item.price)).toEqual([25, 280]);
  });
  it('does not invent longer tiers for a 4-week skill plan', () => {
    const program = find('complete-ball-handling');
    expect(trainingDurationIds(program)).toEqual(['4w']);
    expect(matchesTraining(program, 'skills', '3m')).toBe(false);
    expect(matchesTraining(program, 'skills', '4w')).toBe(true);
  });
  it('preserves all 10 original sellable systems', () => {
    expect(onlineTraining.filter((item) => item.available !== false)).toHaveLength(10);
    for (const program of onlineTraining.filter((item) => item.available !== false)) {
      expect(program.price).toBeGreaterThan(0);
      expect(trainingGoal(program)).toMatch(/performance|strength|skills/);
    }
  });
  it('protects all five supplied previews from accidental release', () => {
    expect(suppliedTrainingPrograms).toHaveLength(5);
    for (const program of suppliedTrainingPrograms) {
      expect(program.available).toBe(false);
      expect(program.price).toBeNull();
      expect(matchesTraining(program, 'all', 'all')).toBe(false);
    }
  });
});
