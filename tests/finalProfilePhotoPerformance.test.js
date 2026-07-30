import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');

describe('final profile photo and quality corrections', () => {
  it('shows an immediate iOS photo preview and persists the avatar on every device', () => {
    const account = read('src/pages/AccountPage.jsx');
    const cloud = read('src/services/sync/cloudState.js');
    expect(account).toContain('src={photoPreview || profile.avatarUrl}');
    expect(account).toContain('accept="image/*"');
    expect(account).toContain('URL.createObjectURL(file)');
    expect(account).toContain('data.saveProfile(nextProfile)');
    expect(account).toContain("auth.updateMetadata({ avatar_url: avatarUrl })");
    expect(cloud).toContain('avatar_url: profile.avatarUrl ?? profile.avatar_url ?? null');
  });

  it('removes the avatar from both profile storage and auth metadata', () => {
    const account = read('src/pages/AccountPage.jsx');
    expect(account).toContain("auth.updateMetadata({ avatar_url: null })");
    expect(account).toContain("avatarUrl: '', avatar_url: null");
  });

  it('does not load the large hero video from a synthetic initial scroll event', () => {
    const hero = read('src/components/experience/CinematicHero.jsx');
    expect(hero).not.toContain("addEventListener('scroll', enable");
    expect(hero).toContain('preload="none"');
  });

  it('provides descriptive hero link text and a valid root llms file', () => {
    const hero = read('src/components/experience/CinematicHero.jsx');
    const llms = read('public/llms.txt');
    expect(hero).toContain('Scroll to academy content');
    expect(llms.startsWith('# Libya Hoops Academy')).toBe(true);
    expect(llms).toContain('> Libya Hoops Academy');
    expect(llms).toContain('## Main pages');
  });
});
