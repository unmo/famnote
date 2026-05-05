import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationBadge } from './NotificationBadge';

describe('NotificationBadge', () => {
  it('count: 0 の場合レンダリングされないこと', () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('count: 1 の場合「1」が表示されること', () => {
    render(<NotificationBadge count={1} disableAnimation />);
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('count: 99 の場合「99」が表示されること', () => {
    render(<NotificationBadge count={99} disableAnimation />);
    expect(screen.getByText('99')).toBeTruthy();
  });

  it('count: 100 以上の場合「99+」が表示されること', () => {
    render(<NotificationBadge count={100} disableAnimation />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('count: 200 の場合も「99+」が表示されること', () => {
    render(<NotificationBadge count={200} disableAnimation />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('count: 1〜4 の場合は sky-500 クラスが適用されること', () => {
    render(<NotificationBadge count={3} disableAnimation />);
    const badge = screen.getByText('3');
    expect(badge.className).toContain('bg-sky-500');
  });

  it('count: 5 以上の場合は amber-500 クラスが適用されること', () => {
    render(<NotificationBadge count={5} disableAnimation />);
    const badge = screen.getByText('5');
    expect(badge.className).toContain('bg-amber-500');
  });

  it('role="status" と aria-live="polite" が設定されていること', () => {
    render(<NotificationBadge count={3} disableAnimation />);
    const badge = screen.getByRole('status');
    expect(badge).toBeTruthy();
    expect(badge.getAttribute('aria-live')).toBe('polite');
  });

  it('カスタム aria-label が設定できること', () => {
    render(<NotificationBadge count={3} disableAnimation aria-label="テスト通知" />);
    const badge = screen.getByLabelText('テスト通知');
    expect(badge).toBeTruthy();
  });
});
