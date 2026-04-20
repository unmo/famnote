import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulletListInput } from '@/components/journals/BulletListInput';

describe('BulletListInput', () => {
  it('正常系: 初期状態で1行表示される', () => {
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['']}
        onChange={onChange}
        maxItems={10}
        placeholder="テスト入力"
      />
    );
    expect(screen.getByPlaceholderText('テスト入力')).toBeTruthy();
  });

  it('正常系: テキスト入力でonChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['']}
        onChange={onChange}
        maxItems={10}
        placeholder="入力してください"
      />
    );

    const input = screen.getByPlaceholderText('入力してください');
    await user.type(input, 'テストテキスト');
    expect(onChange).toHaveBeenCalled();
  });

  it('正常系: Enterキーで新しい行が追加される', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['テスト']}
        onChange={onChange}
        maxItems={10}
        placeholder="入力してください"
      />
    );

    const input = screen.getByPlaceholderText('入力してください');
    await user.click(input);
    await user.keyboard('{Enter}');
    // onChangeが呼ばれ、配列長が2になる
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(2);
  });

  it('正常系: 最大項目数に達するとEnterで追加できない', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['a', 'b', 'c']}
        onChange={onChange}
        maxItems={3}
        placeholder="入力してください"
      />
    );

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[2]);
    await user.keyboard('{Enter}');
    // 上限のため追加されない（onChangeが呼ばれない or 長さ3のまま）
    const calls = onChange.mock.calls;
    if (calls.length > 0) {
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toHaveLength(3);
    }
  });

  it('正常系: ピンボタンをクリックするとonPinToggleが呼ばれる', async () => {
    const user = userEvent.setup();
    const onPinToggle = vi.fn();
    render(
      <BulletListInput
        value={['テスト']}
        onChange={vi.fn()}
        onPinToggle={onPinToggle}
        showPinButton
        maxItems={10}
        placeholder="入力してください"
      />
    );

    const pinButton = screen.getByRole('button', { name: 'この項目をピンする' });
    await user.click(pinButton);
    expect(onPinToggle).toHaveBeenCalledWith(0);
  });

  it('正常系: ピン済み時のaria-pressedがtrueになる', () => {
    render(
      <BulletListInput
        value={['テスト']}
        onChange={vi.fn()}
        pinnedIndices={new Set([0])}
        showPinButton
        maxItems={10}
        placeholder="入力してください"
      />
    );

    const pinButton = screen.getByRole('button', { name: 'ピンを解除する' });
    expect(pinButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('異常系: 最大文字数（100文字）を超えた入力が切り詰められる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['']}
        onChange={onChange}
        maxItems={10}
        maxLength={100}
        placeholder="入力してください"
      />
    );

    const longText = 'a'.repeat(110);
    const input = screen.getByPlaceholderText('入力してください');
    await user.type(input, longText);
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0][0].length).toBeLessThanOrEqual(100);
  });

  it('正常系: 空行でBackspaceを押すと前の行に戻り削除される', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BulletListInput
        value={['最初の行', '']}
        onChange={onChange}
        maxItems={10}
        placeholder="入力してください"
      />
    );

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[1]);
    await user.keyboard('{Backspace}');
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
  });
});
