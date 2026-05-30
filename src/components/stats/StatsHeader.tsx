/** 統計ページのスティッキーヘッダー */
export function StatsHeader() {
  return (
    <header
      role="banner"
      className="px-4 py-3 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-zinc-800/50"
    >
      <h1 className="text-xl font-bold text-zinc-50">成長の記録</h1>
      <p className="text-xs text-zinc-500 mt-0.5">
        直近6ヶ月の練習・試合データを振り返ろう
      </p>
    </header>
  );
}
