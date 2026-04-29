export interface Stamp {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  category: StampCategory;
}

export const STAMP_CATEGORIES = [
  { id: 'cheer',    label: '応援',    labelEn: 'Cheer' },
  { id: 'praise',   label: '称賛',    labelEn: 'Praise' },
  { id: 'emotion',  label: '気持ち',  labelEn: 'Feelings' },
  { id: 'sports',   label: 'スポーツ', labelEn: 'Sports' },
] as const;

export type StampCategory = (typeof STAMP_CATEGORIES)[number]['id'];

export const STAMPS: Stamp[] = [
  // ── 応援 ──
  { id: 'muscle',      emoji: '💪', label: 'がんばれ！',     labelEn: 'Go for it!',    category: 'cheer' },
  { id: 'fire',        emoji: '🔥', label: '燃えてる！',     labelEn: 'On fire!',       category: 'cheer' },
  { id: 'heart',       emoji: '❤️', label: '応援してる！',   labelEn: 'Cheering!',      category: 'cheer' },
  { id: 'rainbow',     emoji: '🌈', label: '信じてる！',     labelEn: 'Believe in you!',category: 'cheer' },
  { id: 'rocket',      emoji: '🚀', label: 'どんどん行け！', labelEn: 'Go go go!',      category: 'cheer' },
  { id: 'fist',        emoji: '✊', label: '全力で！',       labelEn: 'Give it all!',   category: 'cheer' },
  { id: 'pray',        emoji: '🙏', label: '頑張って！',     labelEn: 'You got this!',  category: 'cheer' },
  { id: 'run',         emoji: '🏃', label: '全速力！',       labelEn: 'Full speed!',    category: 'cheer' },

  // ── 称賛 ──
  { id: 'nice',        emoji: '👍', label: 'ナイス！',       labelEn: 'Nice!',          category: 'praise' },
  { id: 'clap',        emoji: '👏', label: 'よくやった！',   labelEn: 'Well done!',     category: 'praise' },
  { id: 'star',        emoji: '⭐', label: 'さすが！',       labelEn: 'Awesome!',       category: 'praise' },
  { id: 'trophy',      emoji: '🏆', label: '最高！',         labelEn: 'Champion!',      category: 'praise' },
  { id: 'great',       emoji: '🎉', label: 'やったね！',     labelEn: 'Congrats!',      category: 'praise' },
  { id: 'crown',       emoji: '👑', label: 'キング！',       labelEn: 'You\'re a king!',category: 'praise' },
  { id: 'hundred',     emoji: '💯', label: '100点！',        labelEn: 'Perfect!',       category: 'praise' },
  { id: 'sparkles',    emoji: '✨', label: 'キラキラ！',     labelEn: 'Shining!',       category: 'praise' },
  { id: 'medal',       emoji: '🥇', label: '金メダル！',     labelEn: 'Gold medal!',    category: 'praise' },
  { id: 'gem',         emoji: '💎', label: 'ダイヤ！',       labelEn: 'Diamond!',       category: 'praise' },

  // ── 気持ち ──
  { id: 'cry_happy',   emoji: '😭', label: '感動した！',     labelEn: 'So proud!',      category: 'emotion' },
  { id: 'love',        emoji: '🥰', label: '大好き！',       labelEn: 'Love you!',      category: 'emotion' },
  { id: 'wow',         emoji: '😲', label: 'すごい！',       labelEn: 'Wow!',           category: 'emotion' },
  { id: 'cool',        emoji: '😎', label: 'かっこいい！',   labelEn: 'So cool!',       category: 'emotion' },
  { id: 'think',       emoji: '🤔', label: '次も期待！',     labelEn: 'Next time!',     category: 'emotion' },
  { id: 'smile',       emoji: '😊', label: 'うれしい！',     labelEn: 'Happy!',         category: 'emotion' },
  { id: 'strong',      emoji: '🦁', label: '強い！',         labelEn: 'Strong!',        category: 'emotion' },
  { id: 'hug',         emoji: '🤗', label: '抱きしめたい！', labelEn: 'Big hug!',       category: 'emotion' },

  // ── スポーツ ──
  { id: 'soccer',      emoji: '⚽', label: 'ゴール！',       labelEn: 'Goal!',          category: 'sports' },
  { id: 'baseball',    emoji: '⚾', label: 'ホームラン！',   labelEn: 'Home run!',      category: 'sports' },
  { id: 'basketball',  emoji: '🏀', label: 'シュート！',     labelEn: 'Shoot!',         category: 'sports' },
  { id: 'tennis',      emoji: '🎾', label: 'エース！',       labelEn: 'Ace!',           category: 'sports' },
  { id: 'swimming',    emoji: '🏊', label: '泳げ！',         labelEn: 'Swim!',          category: 'sports' },
  { id: 'run_sport',   emoji: '🏅', label: '完走！',         labelEn: 'Finish!',        category: 'sports' },
  { id: 'kick',        emoji: '🦵', label: 'キック！',       labelEn: 'Kick!',          category: 'sports' },
  { id: 'vs',          emoji: '⚔️', label: '全力勝負！',     labelEn: 'Fight!',         category: 'sports' },
];

export function getStampById(id: string): Stamp | undefined {
  return STAMPS.find((s) => s.id === id);
}
