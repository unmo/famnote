import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useNoteCount } from '@/hooks/useNoteCount';
import { useAuthStore } from '@/store/authStore';
import { useCountUp } from '@/hooks/useCountUp';

// 成功アイコンのspringアニメーション
const iconVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 },
  },
};

/** Stripe購入完了ページ */
export function PurchaseSuccessPage() {
  // session_idはログ用途のみ（画面表示しない・XSS対策）
  // useSearchParamsを保持してReact RouterのURLパラメータ管理に乗せておく
  const [searchParams] = useSearchParams();
  void searchParams; // session_idは将来のログ送信用に確保（現状は未使用）

  const userProfile = useAuthStore((s) => s.userProfile);
  const { data: noteCountInfo } = useNoteCount();

  // Webhook経由のFirestore更新待ちを考慮し、5秒間スケルトン表示
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const remaining = noteCountInfo?.remaining ?? 0;
  const purchasedCount = userProfile?.purchasedCount ?? 0;

  // 残数カウントアップアニメーション
  const displayRemaining = useCountUp(remaining);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <div className="max-w-sm mx-auto px-4 py-10 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4, staggerChildren: 0.15 } }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* 成功アイコン */}
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="animate"
            role="img"
            aria-label="購入完了"
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* タイトル */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-white">購入ありがとうございます！</h1>
            <p className="text-slate-400 mt-2">100件のノートが追加されました</p>
          </motion.div>

          {/* 残数カード */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-slate-400 text-sm font-medium mb-3">新しいノート残数</p>
            {isInitializing ? (
              <div
                className="h-16 w-32 bg-white/10 rounded-xl animate-pulse mx-auto"
                aria-hidden="true"
              />
            ) : (
              <div
                role="status"
                aria-live="polite"
                aria-label={`ノートの残数は${remaining}件です`}
                className="text-6xl font-black text-sky-400 tabular-nums"
              >
                {displayRemaining}
                <span className="text-xl text-slate-400 ml-2 font-normal">件</span>
              </div>
            )}
          </motion.div>

          {/* J1テーマ解放バナー（初回購入時のみ） */}
          {purchasedCount === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
            >
              <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                <span>★</span>
                <span>J1リーグのチームテーマが解放されました！</span>
              </p>
              <Link
                to="/theme"
                className="text-amber-300 text-sm underline mt-2 inline-block hover:text-amber-200 transition-colors"
              >
                テーマ設定を開く →
              </Link>
            </motion.div>
          )}

          {/* ノートを書くボタン */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="w-full"
          >
            <Link
              to="/notes"
              aria-label="ノート一覧に移動する"
              className="flex items-center justify-center w-full min-h-[52px] bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl px-6 py-3 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              ノートを書く
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
