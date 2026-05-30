import { useMemo } from 'react';
import type { Highlight } from '@/types/highlight';

export interface PastInsightItem {
  label: '1ヶ月前' | '3ヶ月前' | '6ヶ月前';
  highlight: Highlight;
}

/**
 * 日付ベースシードで候補配列からインデックスを選択する。
 * 毎日同じ値が返り、日が変わると変化する。
 */
function selectByDateSeed(candidates: Highlight[]): Highlight {
  const seed = Math.floor(Date.now() / 86400000);
  const index = seed % candidates.length;
  return candidates[index];
}

/**
 * highlights を受け取り、1ヶ月前・3ヶ月前・6ヶ月前の
 * 「日付シード選択済み気づき」を返す純粋計算フック。
 * Firestore クエリは発行しない（useHighlights の結果を受け取る）。
 */
export function usePastInsights(highlights: Highlight[]): PastInsightItem[] {
  return useMemo(() => {
    const today = Date.now();
    // ミリ秒換算
    const DAY_MS = 86400000;

    // 各時点の範囲定義（仕様書通り）
    const periods: Array<{
      label: '1ヶ月前' | '3ヶ月前' | '6ヶ月前';
      minDaysAgo: number;
      maxDaysAgo: number;
    }> = [
      { label: '1ヶ月前', minDaysAgo: 17, maxDaysAgo: 44 },
      { label: '3ヶ月前', minDaysAgo: 77, maxDaysAgo: 104 },
      { label: '6ヶ月前', minDaysAgo: 167, maxDaysAgo: 197 },
    ];

    const result: PastInsightItem[] = [];

    for (const period of periods) {
      const minTime = today - period.maxDaysAgo * DAY_MS;
      const maxTime = today - period.minDaysAgo * DAY_MS;

      const candidates = highlights.filter((h) => {
        const ts = h.sourceDate?.toDate?.()?.getTime?.();
        if (!ts) return false;
        return ts >= minTime && ts <= maxTime;
      });

      if (candidates.length === 0) continue;

      result.push({
        label: period.label,
        highlight: selectByDateSeed(candidates),
      });
    }

    return result;
  }, [highlights]);
}
