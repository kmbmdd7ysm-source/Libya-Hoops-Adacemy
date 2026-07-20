import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CountrySelect from '../src/components/common/CountrySelect';
import { LanguageProvider } from '../src/context/LanguageContext';

function setup() {
  const onChange = vi.fn();
  render(
    <LanguageProvider>
      <CountrySelect id="country-test" value="LY" onChange={onChange} />
    </LanguageProvider>,
  );
  return { onChange };
}

describe('CountrySelect', () => {
  it('supports English and ISO search with keyboard selection', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.click(screen.getByRole('button', { name: /libya/i }));
    const search = screen.getByRole('combobox');
    await user.type(search, 'US');
    expect(screen.getByRole('option', { name: /US/ })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('US');
  });

  it('shows no-results feedback and closes with Escape', async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole('button', { name: /libya/i });
    await user.click(trigger);
    await user.type(screen.getByRole('combobox'), 'not-a-country');
    expect(screen.getByText(/No matching countries/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
