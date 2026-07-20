import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('final production corrections', () => {
  it('renders tracked order money from canonical values in the currently selected currency', () => {
    const page = read('src/pages/OrderDetailPage.jsx');
    expect(page).toContain('useCommerce');
    expect(page).toContain("convertPrice(Number(amount) || 0, order?.currency || 'USD', currency");
    expect(page).toContain('displayAmount(item.unitPrice)');
    expect(page).toContain('displayAmount(order.total)');
  });

  it('keeps Vercel functions ahead of the SPA fallback and validates proxy JSON success', () => {
    const vercel = JSON.parse(read('vercel.json'));
    expect(vercel.routes[0]).toEqual({ handle: 'filesystem' });
    expect(vercel.routes.at(-1)).toEqual({ src: '/.*', dest: '/index.html' });
    const service = read('src/services/formspree.js');
    expect(service).toContain('data?.ok !== true');
    expect(service).toContain("fetch('/api/formspree'");
  });

  it('persists profile photos locally and keeps verification actionable', () => {
    const account = read('src/pages/AccountPage.jsx');
    expect(account).toContain('lha-avatar:');
    expect(account).toContain('writeStoredAvatar(auth.user?.id, avatarUrl)');
    expect(account).toContain('createProfileImageDataUrl(file, 160, 0.62)');
    expect(account).not.toContain('disabled={busy || !auth.cloudConfigured}');
  });
});
