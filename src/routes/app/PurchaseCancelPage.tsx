import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

/** Stripe購入キャンセルページ */
export function PurchaseCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <div className="max-w-sm mx-auto px-4 py-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* キャンセルアイコン */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.div>

          {/* テキスト */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl font-bold text-white">購入をキャンセルしました</h1>
            <p className="text-slate-400 text-sm mt-2">
              お気持ちが変わったらいつでも
              <br />
              購入ページからお手続きください。
            </p>
          </motion.div>

          {/* ボタン類 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full flex flex-col gap-3"
          >
            {/* 購入ページに戻るボタン */}
            <Link
              to="/purchase"
              className="flex items-center justify-center w-full min-h-[52px] border border-white/20 hover:border-white/40 bg-transparent text-white font-semibold rounded-xl px-6 py-3 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              購入ページに戻る
            </Link>

            {/* ダッシュボードに戻るリンク */}
            <Link
              to="/dashboard"
              className="text-slate-400 text-sm underline underline-offset-2 text-center hover:text-slate-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
            >
              ダッシュボードに戻る
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
