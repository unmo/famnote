import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalAccordionBlock } from '@/components/journals/JournalAccordionBlock';

// Framer Motionのモック（テスト環境でアニメーションを無効化）
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('JournalAccordionBlock', () => {
  it('デフォルト展開状態でchildrenが表示される', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" defaultOpen={true}>
        <p>テストコンテンツ</p>
      </JournalAccordionBlock>
    );
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('defaultOpen={false}のときchildrenが非表示になる', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" defaultOpen={false}>
        <p>テストコンテンツ</p>
      </JournalAccordionBlock>
    );
    expect(screen.queryByText('テストコンテンツ')).not.toBeInTheDocument();
  });

  it('ヘッダークリックで折りたたまれる（展開状態から）', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" defaultOpen={true}>
        <p>テストコンテンツ</p>
      </JournalAccordionBlock>
    );
    // ヘッダーボタンをクリック
    const toggleButton = screen.getByRole('button', { name: 'セクションを折りたたむ' });
    fireEvent.click(toggleButton);
    expect(screen.queryByText('テストコンテンツ')).not.toBeInTheDocument();
  });

  it('ヘッダークリックで展開される（折りたたみ状態から）', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" defaultOpen={false}>
        <p>テストコンテンツ</p>
      </JournalAccordionBlock>
    );
    const toggleButton = screen.getByRole('button', { name: 'セクションを展開する' });
    fireEvent.click(toggleButton);
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('onEditが渡された場合に編集ボタンが表示される', () => {
    const onEdit = vi.fn();
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" onEdit={onEdit}>
        <p>コンテンツ</p>
      </JournalAccordionBlock>
    );
    expect(screen.getByRole('button', { name: '試合前の目標を編集する' })).toBeInTheDocument();
  });

  it('onEditが渡されない場合に編集ボタンが非表示になる', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標">
        <p>コンテンツ</p>
      </JournalAccordionBlock>
    );
    expect(screen.queryByRole('button', { name: '試合前の目標を編集する' })).not.toBeInTheDocument();
  });

  it('編集ボタンクリックでonEditが呼ばれる', () => {
    const onEdit = vi.fn();
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" onEdit={onEdit}>
        <p>コンテンツ</p>
      </JournalAccordionBlock>
    );
    fireEvent.click(screen.getByRole('button', { name: '試合前の目標を編集する' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('編集ボタンクリック時にアコーディオンの開閉がトリガーされない（stopPropagation）', () => {
    const onEdit = vi.fn();
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標" defaultOpen={true} onEdit={onEdit}>
        <p>テストコンテンツ</p>
      </JournalAccordionBlock>
    );
    // 編集ボタンをクリック → アコーディオンは閉じないはず
    fireEvent.click(screen.getByRole('button', { name: '試合前の目標を編集する' }));
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('タイトルとアイコンが表示される', () => {
    render(
      <JournalAccordionBlock icon="🎯" title="試合前の目標">
        <p>コンテンツ</p>
      </JournalAccordionBlock>
    );
    expect(screen.getByText('試合前の目標')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });
});
