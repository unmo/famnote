import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, BarChart3, ArrowRight } from 'lucide-react';

// ランディングページ（未認証ユーザー向け）
export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* ヘッダー */}
      <header className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold">FamNote</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium"
            >
              {t('auth.login')}
            </Link>
            <Link
              to="/signup"
              className="btn-primary px-4 py-2 text-sm"
            >
              {t('auth.signup')}
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[var(--color-brand-primary)] to-amber-400 bg-clip-text text-transparent">
              {t('landing.heroTitle')}
            </span>
            <br />
            <span className="text-zinc-50">{t('landing.heroTitleAccent')}</span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            {t('landing.heroSubtext')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2">
              {t('landing.startFree')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2">
              {t('auth.login')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* フィーチャーセクション */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">なぜFamNoteを選ぶのか？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: t('landing.feature1Title'),
                desc: t('landing.feature1Desc'),
              },
              {
                icon: Users,
                title: t('landing.feature2Title'),
                desc: t('landing.feature2Desc'),
              },
              {
                icon: BarChart3,
                title: t('landing.feature3Title'),
                desc: t('landing.feature3Desc'),
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] flex items-center justify-center">
                  <Icon className="text-[var(--color-brand-primary)]" size={24} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[var(--color-brand-primary)] to-amber-500 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('landing.ctaTitle')}</h2>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-zinc-900 font-semibold rounded-xl px-8 py-4 hover:bg-zinc-100 transition-colors mt-4"
          >
            {t('landing.ctaButton')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-zinc-800 py-8 text-zinc-500 text-sm text-center">
        <p>©2026 FamNote. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-2">
          <a href="#" className="hover:text-zinc-300 transition-colors">利用規約</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">プライバシーポリシー</a>
        </div>
      </footer>
    </div>
  );
}
