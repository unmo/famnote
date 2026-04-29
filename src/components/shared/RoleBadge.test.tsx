import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge', () => {
  it('正常系: parentRole が father のとき父バッジキーが表示される', () => {
    render(<RoleBadge parentRole="father" />);
    // i18next モックは key をそのまま返す
    expect(screen.getByText('profile.parentRoleFather')).toBeInTheDocument();
  });

  it('正常系: parentRole が mother のとき母バッジキーが表示される', () => {
    render(<RoleBadge parentRole="mother" />);
    expect(screen.getByText('profile.parentRoleMother')).toBeInTheDocument();
  });

  it('正常系: parentRole が null のとき何も表示されない', () => {
    const { container } = render(<RoleBadge parentRole={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('正常系: parentRole が undefined のとき何も表示されない', () => {
    const { container } = render(<RoleBadge parentRole={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('正常系: className が渡されたとき span に追加される', () => {
    render(<RoleBadge parentRole="father" className="extra-class" />);
    const badge = screen.getByText('profile.parentRoleFather');
    expect(badge.className).toContain('extra-class');
  });

  it('正常系: father バッジは青系スタイルを持つ', () => {
    render(<RoleBadge parentRole="father" />);
    const badge = screen.getByText('profile.parentRoleFather');
    expect(badge.className).toContain('text-blue-400');
    expect(badge.className).toContain('bg-blue-500/20');
  });

  it('正常系: mother バッジはピンク系スタイルを持つ', () => {
    render(<RoleBadge parentRole="mother" />);
    const badge = screen.getByText('profile.parentRoleMother');
    expect(badge.className).toContain('text-pink-400');
    expect(badge.className).toContain('bg-pink-500/20');
  });
});
