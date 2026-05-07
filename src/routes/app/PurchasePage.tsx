import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { useNoteCount } from '@/hooks/useNoteCount';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { PACK_NOTE_COUNT } from '@/types/noteCount';

// ページ全体のフェードイン
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

// カードのstaggerアニメーション
const containerVariants: Variants = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

/** 現在の状況カード */
function CurrentStatusCard({
  remaining,
  plan,
  isLoading,
}: {
  remaining: number;
  plan: 'free' | 'paid';
  isLoading: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <p className="text-slate-400 text-sm font-medium mb-3">現在の状況</p>
      {isLoading ? (
        <>
          <div className="h-12 w-24 bg-white/10 rounded-lg animate-pulse" aria-hidden="true" />
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse mt-2" aria-hidden="true" />
        </>
      ) : (
        <>
          <div
            role="status"
            aria-label={`現在の残数は${remaining}件です`}
            className="flex items-baseline gap-1"
          >
            <span className="text-5xl font-black text-sky-400 tabular-nums">{remaining}</span>
            <span className="text-xl text-slate-400 ml-1">件</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            プラン: {plan === 'paid' ? '有料プラン' : '無料プラン'}
          </p>
        </>
      )}
    </div>
  );
}

/** 購入パックカード */
function PurchasePackCard({
  currentRemaining,
  purchasedCount,
  isLoading,
}: {
  currentRemaining: number;
  purchasedCount: number;
  isLoading: boolean;
}) {
  const afterRemaining = currentRemaining + PACK_NOTE_COUNT;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <p className="text-slate-400 text-sm font-medium mb-4">追加パック</p>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-white">{PACK_NOTE_COUNT}件</span>
        <span className="text-slate-400 text-sm">追加</span>
      </div>

      <p className="text-3xl font-bold text-white mt-3">¥480</p>
      <p className="text-slate-500 text-xs mt-1">税込 · 自動更新なし · 一回限り</p>

      <div className="border-t border-white/10 my-4" />

      {/* 購入後の残数プレビュー */}
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <span>現在</span>
        {isLoading ? (
          <span className="h-4 w-10 bg-white/10 rounded animate-pulse inline-block" />
        ) : (
          <span className="text-sky-400 font-bold">{currentRemaining}件</span>
        )}
        <span className="text-slate-500">→</span>
        <span>購入後</span>
        {isLoading ? (
          <span className="h-4 w-10 bg-white/10 rounded animate-pulse inline-block" />
        ) : (
          <span className="text-sky-400 font-bold">{afterRemaining}件</span>
        )}
      </div>

      {/* J1テーマ解放バナー（初回購入ユーザーのみ） */}
      {purchasedCount === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mt-4 flex items-center gap-2">
          <span className="text-amber-400">★</span>
          <span className="text-amber-400 text-sm">
            購入するとJ1リーグのチームテーマが解放されます！
          </span>
        </div>
      )}
    </div>
  );
}

/** Stripe課金連携 購入確認ページ */
export function PurchasePage() {
  const userProfile = useAuthStore((s) => s.userProfile);
  const group = useGroupStore((s) => s.group);
  const { data: noteCountInfo, isLoading } = useNoteCount();
  const { startCheckout, isLoading: isCheckoutLoading } = useStripeCheckout();

  // グループオーナー判定
  const isGroupOwner = group?.ownerUid === userProfile?.uid;

  const remaining = noteCountInfo?.remaining ?? 0;
  const plan = noteCountInfo?.plan ?? 'free';
  const purchasedCount = userProfile?.purchasedCount ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-lg mx-auto px-4 py-6 sm:px-6 sm:py-10">
        {/* 戻るリンク */}
        <Link
          to="/dashboard"
          aria-label="前のページに戻る"
          className="inline-flex items-center gap-1 text-slate-400 text-sm mb-6 hover:text-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
        >
          ← 戻る
        </Link>

        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <h1 className="text-2xl font-bold text-white mb-6">ノートを追加購入</h1>

          {/* グループオーナー以外への警告 */}
          {!isGroupOwner && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm mb-6">
              購入はグループオーナーのみ可能です。
            </div>
          )}

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {/* 現在の状況カード */}
            <motion.div variants={cardVariants}>
              <CurrentStatusCard
                remaining={remaining}
                plan={plan}
                isLoading={isLoading}
              />
            </motion.div>

            {/* 購入パックカード */}
            <motion.div variants={cardVariants}>
              <PurchasePackCard
                currentRemaining={remaining}
                purchasedCount={purchasedCount}
                isLoading={isLoading}
              />
            </motion.div>

            {/* 購入ボタン */}
            <motion.div variants={cardVariants}>
              <motion.button
                type="button"
                onClick={startCheckout}
                disabled={isCheckoutLoading || !isGroupOwner}
                aria-label="¥480でノート100件を購入する"
                aria-busy={isCheckoutLoading}
                aria-disabled={isCheckoutLoading || !isGroupOwner}
                whileHover={isCheckoutLoading ? undefined : { scale: 1.01 }}
                whileTap={isCheckoutLoading ? undefined : { scale: 0.98 }}
                className={`w-full min-h-[52px] flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isCheckoutLoading || !isGroupOwner
                    ? 'bg-sky-500 text-white opacity-60 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-400 text-white'
                }`}
              >
                {isCheckoutLoading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>処理中...</span>
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    <span>¥480で購入する</span>
                  </>
                )}
              </motion.button>

              {/* Stripeバッジ */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-slate-500 text-xs">Stripe による安全な決済</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
