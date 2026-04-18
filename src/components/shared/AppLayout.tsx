import { Outlet } from 'react-router-dom';
import { SideNav, BottomNav } from './BottomNav';

// アプリ全体のレイアウト（認証済みページ用）
export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      {/* デスクトップ用サイドナビ */}
      <SideNav />

      {/* メインコンテンツ */}
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* モバイル用ボトムナビ */}
      <BottomNav />
    </div>
  );
}
