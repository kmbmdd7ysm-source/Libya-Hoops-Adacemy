import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('final launch media requirements', () => {
  it('removes the desktop-only WebGL/decorative hero overlay', () => {
    const hero = read('src/components/experience/CinematicHero.jsx');
    expect(hero).not.toContain('HeroDepth');
    expect(hero).not.toContain('hero-vignette');
    expect(hero).not.toContain('hero-noise');
  });

  it('uses the same reliable image component for programs, events and online training', () => {
    for (const file of [
      'src/components/programs/ProgramCard.jsx',
      'src/components/events/EventCard.jsx',
      'src/components/training/TrainingCard.jsx',
    ]) {
      expect(read(file)).toContain('SmartImage');
    }
    const image = read('src/components/common/SmartImage.jsx');
    expect(image).toContain('MEDIA_VERSION');
    expect(image).toContain("decoding=\"async\"");
    expect(image).toContain('setAttempt(1)');
  });

  it('keeps every referenced program, event and training image in public', () => {
    for (const file of ['src/data/programs.js', 'src/data/events.js', 'src/data/onlineTraining.js']) {
      const source = read(file);
      const references = [...source.matchAll(/["'](\/images\/(?:programs|events|training)\/[^"']+\.(?:jpg|jpeg|png|webp))["']/gi)].map((m) => m[1]);
      expect(references.length).toBeGreaterThan(0);
      for (const reference of references) {
        expect(fs.existsSync(path.join(root, 'public', reference))).toBe(true);
      }
    }
  });

  it('keeps the order email endpoint and resilient proxy/direct delivery', () => {
    const service = read('src/services/formspree.js');
    const api = read('api/formspree.js');
    expect(service).toContain('https://formspree.io/f/mqerbqvd');
    expect(api).toContain('https://formspree.io/f/mqerbqvd');
    expect(service).toContain('retry(() => postThroughSite(body), 3)');
    expect(service).toContain('retry(() => postDirect(body), 2)');
  });
});
