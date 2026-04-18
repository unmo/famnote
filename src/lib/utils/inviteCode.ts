// 6桁の英数字招待コードを生成するユーティリティ

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

// ランダムな6桁英数字コードを生成
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    // セキュアなランダム生成
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

// コードが正しい形式かバリデーション
export function validateInviteCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim().toUpperCase();
  return /^[A-Z0-9]{6}$/.test(trimmed);
}

// コードを正規化（大文字化・スペース除去）
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s/g, '');
}
