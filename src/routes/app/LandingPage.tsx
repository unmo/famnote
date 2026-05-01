import { motion, useMotionValue, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Trophy,
  Users,
  Target,
  Star,
  Palette,
  ChevronDown,
  ArrowRight,
  Check,
  Sparkles,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

// ブランドカラーCSS変数（フォールバック付き）
const brandPrimary = 'var(--color-brand-primary, #E85513)';
const brandGradient = `linear-gradient(135deg, var(--color-brand-primary, #E85513), #f59e0b)`;

// ---- LandingHeader --------------------------------------------------------

function LandingHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-testid="landing-header"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: brandPrimary }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-50">FamNote</span>
          </div>

          {/* ナビゲーション */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-200 px-3 py-2"
            >
              {t('auth.login')}
            </Link>
            <Link
              to="/signup"
              className="btn-primary text-sm px-4 py-2 min-h-[44px] flex items-center"
            >
              {t('landing.startFree')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---- LandingHero ----------------------------------------------------------

function LandingHero() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="landing-hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 overflow-hidden"
    >
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: brandPrimary }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* 見出し */}
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-50 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {t('landing.heroTitle')}
          <br />
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-brand-primary,#E85513)] to-amber-400"
          >
            {t('landing.heroTitleAccent')}
          </span>
        </motion.h1>

        {/* サブテキスト */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          {t('landing.heroSubtext')}
        </motion.p>

        {/* CTAボタン群 */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        >
          <Link
            to="/signup"
            className="btn-primary px-8 py-4 text-base font-semibold min-h-[52px] min-w-[200px] flex items-center justify-center rounded-xl shadow-lg"
            style={{ boxShadow: '0 0 30px color-mix(in srgb, var(--color-brand-primary, #E85513) 40%, transparent)' }}
          >
            {t('landing.startFree')}
          </Link>
          <Link
            to="/login"
            className="btn-secondary px-8 py-4 text-base font-semibold min-h-[52px] min-w-[160px] flex items-center justify-center rounded-xl"
          >
            {t('landing.watchDemo')}
          </Link>
        </motion.div>

        {/* バッジ */}
        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-full text-xs text-zinc-400">
            <Check className="w-3.5 h-3.5 text-green-400" />
            {t('landing.heroBadgeFree')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-full text-xs text-zinc-400">
            <Check className="w-3.5 h-3.5 text-green-400" />
            {t('landing.heroBadgeNoCard')}
          </span>
        </motion.div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-500"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}

// ---- StatItem（カウントアップアニメーション） -----------------------------------

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  index: number;
}

function StatItem({ value, suffix = '', label, index }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // IntersectionObserver でビュー内に入ったらカウントアップ開始
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          motionValue.set(value);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (v) => setDisplay(v));
  }, [springValue]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="text-4xl md:text-5xl font-extrabold text-zinc-50">
        <span>{Math.round(display)}</span>
        <span style={{ color: brandPrimary }}>{suffix}</span>
      </div>
      <p className="mt-2 text-sm md:text-base text-zinc-400">{label}</p>
    </motion.div>
  );
}

// ---- LandingSocialProof ---------------------------------------------------

function LandingSocialProof() {
  const { t } = useTranslation();

  const stats: Array<{ value: number; suffix: string; label: string }> = [
    { value: 8,   suffix: '',  label: t('landing.statRecordTypesLabel') },
    { value: 20,  suffix: '+', label: t('landing.statSportsLabel') },
    { value: 10,  suffix: '',  label: t('landing.statMembersLabel') },
    { value: 365, suffix: '',  label: t('landing.statStreakLabel') },
  ];

  return (
    <section
      data-testid="landing-social-proof"
      className="bg-zinc-900 border-y border-zinc-800 py-16 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <StatItem
              key={i}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- FeatureCard ----------------------------------------------------------

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: 'free' | 'premium';
  badgeLabel: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, description, badge, badgeLabel }: FeatureCardProps) {
  const isPremium = badge === 'premium';

  return (
    <motion.div
      className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-200 hover:border-[color:var(--color-brand-primary,#E85513)]"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* バッジ（右上） */}
      <div className="absolute top-4 right-4">
        {isPremium ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {badgeLabel}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            {badgeLabel}
          </span>
        )}
      </div>

      {/* アイコン */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand-primary, #E85513) 15%, transparent)' }}
      >
        <Icon className="w-6 h-6" style={{ color: brandPrimary }} />
      </div>

      {/* テキスト */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-zinc-50 pr-16 line-clamp-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{description}</p>
      </div>
    </motion.div>
  );
}

// ---- LandingFeatures ------------------------------------------------------

function LandingFeatures() {
  const { t } = useTranslation();

  const features: Array<{
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    badgeKey: string;
    badge: 'free' | 'premium';
  }> = [
    { icon: BookOpen, titleKey: 'feature1Title', descKey: 'feature1Desc', badgeKey: 'feature1Badge', badge: 'free' },
    { icon: Trophy,   titleKey: 'feature2Title', descKey: 'feature2Desc', badgeKey: 'feature2Badge', badge: 'free' },
    { icon: Users,    titleKey: 'feature3Title', descKey: 'feature3Desc', badgeKey: 'feature3Badge', badge: 'free' },
    { icon: Target,   titleKey: 'feature4Title', descKey: 'feature4Desc', badgeKey: 'feature4Badge', badge: 'free' },
    { icon: Star,     titleKey: 'feature5Title', descKey: 'feature5Desc', badgeKey: 'feature5Badge', badge: 'free' },
    { icon: Palette,  titleKey: 'feature6Title', descKey: 'feature6Desc', badgeKey: 'feature6Badge', badge: 'premium' },
  ];

  return (
    <section
      data-testid="landing-features"
      className="bg-zinc-950 py-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* セクションヘッダー */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50">
            {t('landing.featuresSectionTitle')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
            {t('landing.featuresSectionSubtitle')}
          </p>
        </motion.div>

        {/* カードグリッド */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={t(`landing.${feature.titleKey}`)}
              description={t(`landing.${feature.descKey}`)}
              badge={feature.badge}
              badgeLabel={t(`landing.${feature.badgeKey}`)}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---- StepItem -------------------------------------------------------------

interface Step {
  number: number;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

function StepItem({ step, index }: { step: Step; index: number }) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex flex-col items-center text-center flex-1 max-w-xs mx-auto md:mx-0"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
    >
      {/* アイコン + ステップ番号バッジ */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-brand-primary, #E85513) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-brand-primary, #E85513) 30%, transparent)',
          }}
        >
          <step.icon className="w-8 h-8" style={{ color: brandPrimary }} />
        </div>
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: brandPrimary }}
        >
          {step.number}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-50 mb-2">
        {t(`landing.${step.titleKey}`)}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {t(`landing.${step.descKey}`)}
      </p>
    </motion.div>
  );
}

// ---- LandingHowItWorks ----------------------------------------------------

function LandingHowItWorks() {
  const { t } = useTranslation();

  const steps: Step[] = [
    { number: 1, icon: UserPlus,   titleKey: 'step1Title', descKey: 'step1Desc' },
    { number: 2, icon: UsersRound, titleKey: 'step2Title', descKey: 'step2Desc' },
    { number: 3, icon: BookOpen,   titleKey: 'step3Title', descKey: 'step3Desc' },
  ];

  return (
    <section
      data-testid="landing-how-it-works"
      className="bg-zinc-900 border-y border-zinc-800 py-24 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50">
            {t('landing.howItWorksSectionTitle')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-zinc-400">
            {t('landing.howItWorksSectionSubtitle')}
          </p>
        </motion.div>

        {/* ステップ群 */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col md:flex-row items-center flex-1">
              <StepItem step={step} index={i} />
              {/* 矢印: デスクトップのみ、最後のステップ後は非表示 */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center flex-shrink-0 px-4 mt-8">
                  <ArrowRight className="w-6 h-6 text-zinc-600" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- PricingCard ----------------------------------------------------------

const freeFeatureKeys = ['freePlanFeature1', 'freePlanFeature2', 'freePlanFeature3', 'freePlanFeature4'] as const;
const premiumFeatureKeys = [
  'premiumPlanFeature1',
  'premiumPlanFeature2',
  'premiumPlanFeature3',
  'premiumPlanFeature4',
  'premiumPlanFeature5',
  'premiumPlanFeature6',
] as const;

interface PricingCardProps {
  plan: 'free' | 'premium';
}

function PricingCard({ plan }: PricingCardProps) {
  const { t } = useTranslation();
  const isPremium = plan === 'premium';
  const featureKeys = isPremium ? premiumFeatureKeys : freeFeatureKeys;

  return (
    <motion.div
      className={[
        'relative flex-1 rounded-2xl p-8 flex flex-col gap-6',
        isPremium
          ? 'bg-zinc-900 border-2 shadow-xl'
          : 'bg-zinc-900 border border-zinc-800',
      ].join(' ')}
      style={isPremium ? {
        borderColor: brandPrimary,
        boxShadow: '0 0 40px color-mix(in srgb, var(--color-brand-primary, #E85513) 20%, transparent)',
      } : {}}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: isPremium ? 0.2 : 0.1 }}
    >
      {/* おすすめバッジ（プレミアムのみ） */}
      {isPremium && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: brandPrimary }}
          >
            {t('landing.premiumBadge')}
          </span>
        </div>
      )}

      {/* プラン名 */}
      <h3 className="text-xl font-bold text-zinc-50">
        {t(isPremium ? 'landing.premiumPlanName' : 'landing.freePlanName')}
      </h3>

      {/* 価格 */}
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-zinc-50">
          {t(isPremium ? 'landing.premiumPlanPrice' : 'landing.freePlanPrice')}
        </span>
        <span className="text-zinc-400 text-sm">
          {t(isPremium ? 'landing.premiumPlanPeriod' : 'landing.freePlanPeriod')}
        </span>
      </div>

      {/* 機能リスト */}
      <ul className="flex flex-col gap-3 flex-grow">
        {featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-400" />
            <span className="text-sm text-zinc-300">{t(`landing.${key}`)}</span>
          </li>
        ))}
      </ul>

      {/* CTAボタン */}
      <Link
        to="/signup"
        className={[
          'w-full py-3 rounded-xl text-sm font-semibold text-center',
          'transition-all duration-200 min-h-[44px] flex items-center justify-center',
          isPremium ? 'btn-primary' : 'btn-secondary',
        ].join(' ')}
      >
        {t(isPremium ? 'landing.startPremiumPlan' : 'landing.startFreePlan')}
      </Link>
    </motion.div>
  );
}

// ---- LandingPricing -------------------------------------------------------

function LandingPricing() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="landing-pricing"
      className="bg-zinc-950 py-24 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50">
            {t('landing.pricingSectionTitle')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-zinc-400">
            {t('landing.pricingSectionSubtitle')}
          </p>
        </motion.div>

        {/* 年間割引バナー */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
            {t('landing.annualDiscount')}
          </span>
        </motion.div>

        {/* プランカード群 */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <PricingCard plan="free" />
          <PricingCard plan="premium" />
        </div>
      </div>
    </section>
  );
}

// ---- LandingFinalCTA ------------------------------------------------------

function LandingFinalCTA() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="landing-cta"
      className="bg-zinc-950 py-24 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="rounded-3xl px-8 py-16 md:px-16 text-center overflow-hidden relative"
          style={{ background: brandGradient }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* 背景装飾 */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            aria-hidden="true"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%)' }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              {t('landing.ctaFinalTitle')}
            </h2>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto">
              {t('landing.ctaFinalSubtext')}
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold bg-white hover:bg-zinc-50 transition-colors duration-200 min-h-[52px] min-w-[200px]"
              style={{ color: brandPrimary }}
            >
              {t('landing.ctaButton')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- LandingFooter --------------------------------------------------------

function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer
      data-testid="landing-footer"
      className="bg-zinc-900 border-t border-zinc-800 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* コピーライト */}
          <p className="text-sm text-zinc-500 order-2 md:order-1">
            ©2026 FamNote. All rights reserved.
          </p>

          {/* リンク群 */}
          <div className="flex items-center gap-4 flex-wrap justify-center order-1 md:order-2">
            <Link
              to="/legal"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-200"
            >
              特定商取引法に基づく表示
            </Link>
            <Link
              to="/help"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-200"
            >
              ヘルプ
            </Link>
            <a
              href="/terms"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-200"
            >
              {t('landing.footerTerms')}
            </a>
            <a
              href="/privacy"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors duration-200"
            >
              {t('landing.footerPrivacy')}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- LandingPage（メインエクスポート） ----------------------------------------

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingFinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
