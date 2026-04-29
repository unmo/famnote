import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSelector } from './RoleSelector';

describe('RoleSelector', () => {
  it('正常系: 3つの選択肢が表示される', () => {
    const onChange = vi.fn();
    render(<RoleSelector value={null} onChange={onChange} />);
    expect(screen.getByText('profile.parentRoleFather')).toBeInTheDocument();
    expect(screen.getByText('profile.parentRoleMother')).toBeInTheDocument();
    expect(screen.getByText('profile.parentRoleNone')).toBeInTheDocument();
  });

  it('正常系: father ボタンをクリックすると onChange("father") が呼ばれる', () => {
    const onChange = vi.fn();
    render(<RoleSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('profile.parentRoleFather'));
    expect(onChange).toHaveBeenCalledWith('father');
  });

  it('正常系: mother ボタンをクリックすると onChange("mother") が呼ばれる', () => {
    const onChange = vi.fn();
    render(<RoleSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('profile.parentRoleMother'));
    expect(onChange).toHaveBeenCalledWith('mother');
  });

  it('正常系: 設定しないをクリックすると onChange(null) が呼ばれる', () => {
    const onChange = vi.fn();
    render(<RoleSelector value="father" onChange={onChange} />);
    fireEvent.click(screen.getByText('profile.parentRoleNone'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('正常系: value="father" のとき father ボタンが aria-checked="true"', () => {
    render(<RoleSelector value="father" onChange={vi.fn()} />);
    const fatherBtn = screen.getByRole('radio', { name: 'profile.parentRoleFather' });
    expect(fatherBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('正常系: value=null のとき設定しないボタンが aria-checked="true"', () => {
    render(<RoleSelector value={null} onChange={vi.fn()} />);
    const noneBtn = screen.getByRole('radio', { name: 'profile.parentRoleNone' });
    expect(noneBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('正常系: disabled=true のとき opacity-50 クラスが付く', () => {
    render(<RoleSelector value={null} onChange={vi.fn()} disabled />);
    const group = screen.getByRole('radiogroup');
    expect(group.className).toContain('opacity-50');
  });
});
