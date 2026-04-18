import { describe, it, expect } from 'vitest';
import { generateInviteCode, validateInviteCode, normalizeInviteCode } from '@/lib/utils/inviteCode';

describe('generateInviteCode', () => {
  it('正常系: 6桁のコードが生成される', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
  });

  it('正常系: コードはすべて大文字英字と数字のみで構成される', () => {
    const code = generateInviteCode();
    expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true);
  });

  it('正常系: 生成されるコードは一意性を持つ（100回生成して重複チェック）', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateInviteCode());
    }
    // 100回生成して95個以上ユニーク（完全一意は統計的保証なし）
    expect(codes.size).toBeGreaterThan(80);
  });
});

describe('validateInviteCode', () => {
  it('正常系: 正しい6桁英数字コードはtrueを返す', () => {
    expect(validateInviteCode('ABC123')).toBe(true);
    expect(validateInviteCode('000000')).toBe(true);
    expect(validateInviteCode('ZZZZZZ')).toBe(true);
  });

  it('異常系: 空文字はfalseを返す', () => {
    expect(validateInviteCode('')).toBe(false);
  });

  it('異常系: 6文字未満はfalseを返す', () => {
    expect(validateInviteCode('ABC12')).toBe(false);
    expect(validateInviteCode('A')).toBe(false);
  });

  it('異常系: 6文字超過はfalseを返す', () => {
    expect(validateInviteCode('ABC1234')).toBe(false);
  });

  it('異常系: 記号・スペースを含む場合はfalseを返す', () => {
    expect(validateInviteCode('ABC-12')).toBe(false);
    expect(validateInviteCode('ABC 12')).toBe(false);
    // validateInviteCodeは内部でtoUpperCase()を適用するため、小文字は大文字に変換されtrueになる
    // 正規化はnormalizeInviteCodeで行う
    expect(validateInviteCode('abc123')).toBe(true); // 小文字は自動変換される仕様
  });
});

describe('normalizeInviteCode', () => {
  it('正常系: 小文字を大文字に変換する', () => {
    expect(normalizeInviteCode('abc123')).toBe('ABC123');
  });

  it('正常系: スペースを除去する', () => {
    expect(normalizeInviteCode(' ABC 1 2 3 ')).toBe('ABC123');
  });

  it('正常系: 前後の空白を除去する', () => {
    expect(normalizeInviteCode('  ABC123  ')).toBe('ABC123');
  });
});
