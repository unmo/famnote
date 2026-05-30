/** 月次練習統計（グラフ用） */
export interface MonthlyPracticeStats {
  /** "2026-01" 形式 */
  monthKey: string;
  /** 表示用ラベル "1月" */
  monthLabel: string;
  /** 練習回数 */
  practiceCount: number;
  /** 合計練習時間（分） */
  totalMinutes: number;
  /** 平均体調スコア（null = データなし） */
  avgCondition: number | null;
}

export interface MonthlyMatchStats {
  monthKey: string;
  monthLabel: string;
  /** 試合数（status='completed'） */
  matchCount: number;
  winCount: number;
  drawCount: number;
  lossCount: number;
  /** 勝率 0〜100（matchCount=0 の場合 null） */
  winRate: number | null;
}

/** /stats ページ全体の集計データ */
export interface StatsData {
  practiceStats: MonthlyPracticeStats[];
  matchStats: MonthlyMatchStats[];
  /** 直近6ヶ月の合計値 */
  totals: {
    practiceCount: number;
    totalHours: number;
    matchCount: number;
    winRate: number | null;
  };
}
