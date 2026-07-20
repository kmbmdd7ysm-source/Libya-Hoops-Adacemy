import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import Icon from '../src/components/icons/Icon';
import QuantitySelector from '../src/components/common/QuantitySelector';
import { LanguageProvider } from '../src/context/LanguageContext';

function renderWithLanguage(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function sourceFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(jsx?|tsx?|css)$/.test(entry.name) ? [full] : [];
  });
}

describe('final repository-wide verification', () => {
  it('renders every migrated interaction icon as one accessible decorative SVG', () => {
    const names = [
      'close',
      'back',
      'check',
      'alert',
      'chevron',
      'plus',
      'minus',
      'heart',
      'compare',
    ];
    const { container } = render(names.map((name) => <Icon key={name} name={name} />));
    expect(container.querySelectorAll('svg')).toHaveLength(names.length);
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg.textContent).toBe('');
    });
  });

  it('renders quantity controls with SVG buttons and preserves min/max behavior', () => {
    const onChange = vi.fn();
    const { container, rerender } = renderWithLanguage(
      <QuantitySelector value={1} min={1} max={2} onChange={onChange} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[0].querySelector('svg')).toBeInTheDocument();
    expect(buttons[1].querySelector('svg')).toBeInTheDocument();
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith(2);

    rerender(
      <LanguageProvider>
        <QuantitySelector value={2} min={1} max={2} onChange={onChange} />
      </LanguageProvider>,
    );
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
    expect(container.textContent).not.toMatch(/[−+]/);
  });

  it('contains no remaining interface glyph literals in application JSX or CSS', () => {
    const allowedContent = ['OrderDetailPage.jsx', 'OrderCard.jsx', 'CartDrawer.jsx', 'events.js'];
    const forbidden = /[✓✕←→⌄♥♡⇄☰−▾]/;
    const violations = sourceFiles(path.join(process.cwd(), 'src'))
      .filter((file) => !allowedContent.some((name) => file.endsWith(name)))
      .flatMap((file) => {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        return lines.flatMap((line, index) =>
          forbidden.test(line) && !line.trim().startsWith('//')
            ? [`${path.relative(process.cwd(), file)}:${index + 1}`]
            : [],
        );
      });
    expect(violations).toEqual([]);
  });

  it('keeps only the final production implementation report', () => {
    const reports = fs
      .readdirSync(process.cwd())
      .filter((name) => /(?:REPORT|REVIEW).*\.md$/i.test(name));
    expect(reports).toEqual(['FINAL_MANDATORY_CORRECTION_REPORT.md']);
  });
});
