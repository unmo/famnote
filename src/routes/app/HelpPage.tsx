/**
 * ヘルプページ
 * FamNoteのすべての機能を説明するマニュアルページ
 * 認証不要でアクセス可能
 */
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  ChevronRight,
  Check,
  Smartphone,
  CreditCard,
  Palette,
  Users,
  FileText,
  Trophy,
} from "lucide-react";
import { LegalHeader, LegalFooter } from "../../components/shared/LegalPageLayout";

// ========================
// 型定義
// ========================

/** 目次アイテムの型 */
interface HelpTocItem {
  id: string;
  label: string;
  icon: ReactNode;
}

/** 手順ステップの型 */
interface HelpStep {
  step: number;
  title: string;
  description: string;
}

// ========================
// カスタムフック
// ========================

/**
 * スクロールアニメーション用カスタムHook
 * IntersectionObserverを使って要素が画面内に入ったらフェードイン
 */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ========================
// ヒーローセクション
// ========================

/**
 * ヘルプページのヒーローセクション
 * zinc-950ベース + グロー装飾
 */
function HelpHero() {
  const { t } = useTranslation();

  return (
    <section className="relative bg-zinc-950 pt-24 pb-16 overflow-hidden">
      {/* グリッドパターン背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,85,19,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(232,85,19,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* グローエフェクト装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-10 left-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 15%, transparent)" }}
        />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* パンくずナビ */}
        <nav className="flex items-center gap-1 text-xs text-zinc-400 mb-6" aria-label="パンくずナビ">
          <Link to="/" className="hover:text-white transition-colors duration-200">
            FamNote
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{t("help.pageTitle", "ヘルプ・使い方ガイド")}</span>
        </nav>

        {/* ページタイトル */}
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)",
              color: "var(--color-brand-primary, #0EA5E9)",
            }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {t("help.heroTitle", "FamNoteの使い方")}
            </h1>
            <p className="mt-2 text-zinc-300 text-sm sm:text-base">
              {t(
                "help.heroSubtitle",
                "練習ノートから試合記録・家族タイムラインまで、FamNoteのすべての機能をご紹介します。"
              )}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{t("help.lastUpdated", "最終更新: 2026年4月")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================
// スマートフォンモックアップ
// ========================

/**
 * スマートフォンフレームラッパー
 */
function PhoneMockup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      aria-hidden="true"
      role="img"
      aria-label={label}
      className="relative mx-auto w-[220px] sm:w-[260px] bg-zinc-900 rounded-[2.5rem] border-[3px] border-zinc-700 shadow-2xl overflow-hidden"
    >
      {/* ノッチ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-2xl z-10" />
      {/* 画面コンテンツ */}
      <div className="bg-[#0a0a14] pt-7 pb-2 min-h-[460px] flex flex-col">
        {children}
      </div>
    </div>
  );
}

/** FamNoteアプリ内ボトムナビ（モックアップ共通） */
function MockBottomNav({ active }: { active: number }) {
  const icons = [FileText, Trophy, Users, Palette, CreditCard];
  return (
    <div
      className="flex items-center justify-around py-2 mt-auto"
      style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
    >
      {icons.map((Icon, i) => (
        <Icon
          key={i}
          className="w-4 h-4"
          style={i === active ? { color: "var(--color-brand-primary, #0EA5E9)" } : { color: "#52525b" }}
        />
      ))}
    </div>
  );
}

/**
 * ログイン画面モックアップ（はじめにセクション用）
 */
function LoginMockup() {
  const { t } = useTranslation();

  return (
    <PhoneMockup label={t("help.mock.login.ariaLabel", "ログイン画面のモックアップ")}>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* FamNoteロゴ */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)" }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
          >
            F
          </span>
        </div>
        <p className="text-white text-sm font-bold tracking-wide mb-1">
          Fam<span style={{ color: "var(--color-brand-primary, #0EA5E9)" }}>Note</span>
        </p>
        <p className="text-zinc-400 text-[9px] text-center mb-6">
          {t("help.mock.login.tagline", "家族の成長を一緒に記録しよう")}
        </p>

        {/* Googleログインボタン */}
        <button
          className="w-full rounded-xl py-2.5 text-white text-[10px] font-bold flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-brand-primary, #0EA5E9)",
            boxShadow: "0 0 12px color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 40%, transparent)",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          </svg>
          {t("help.mock.login.loginButton", "Googleでログイン")}
        </button>

        <p className="text-zinc-600 text-[8px] mt-4 text-center">
          {t("help.mock.login.footer", "利用規約・プライバシーポリシーに同意して続行")}
        </p>
      </div>
    </PhoneMockup>
  );
}

/**
 * 練習ノート一覧モックアップ
 */
function NotesMockup() {
  const { t } = useTranslation();

  const noteItems = [
    { titleKey: "help.mock.notes.item1Title", dateKey: "help.mock.notes.item1Date", tagKey: "help.mock.notes.item1Tag" },
    { titleKey: "help.mock.notes.item2Title", dateKey: "help.mock.notes.item2Date", tagKey: "help.mock.notes.item2Tag" },
    { titleKey: "help.mock.notes.item3Title", dateKey: "help.mock.notes.item3Date", tagKey: "help.mock.notes.item3Tag" },
  ];

  return (
    <PhoneMockup label={t("help.mock.notes.ariaLabel", "練習ノート一覧のモックアップ")}>
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
      >
        <span className="text-white text-xs font-bold">{t("help.mock.notes.header", "練習ノート")}</span>
        <div className="w-5 h-5 rounded-full bg-zinc-600" />
      </div>

      <div className="flex-1 px-2 pt-3 space-y-2">
        {noteItems.map((item) => (
          <div key={item.titleKey} className="bg-zinc-800 rounded-xl p-2.5">
            <div className="flex items-start justify-between gap-1">
              <p className="text-white text-[10px] font-semibold leading-snug">
                {t(item.titleKey, "練習ノート")}
              </p>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)",
                  color: "var(--color-brand-primary, #0EA5E9)",
                }}
              >
                {t(item.tagKey, "サッカー")}
              </span>
            </div>
            <p className="text-zinc-500 text-[9px] mt-0.5">{t(item.dateKey, "4月15日")}</p>
          </div>
        ))}

        {/* 記録追加ボタン */}
        <button
          className="w-full rounded-xl py-2 text-white text-[10px] font-bold text-center mt-1"
          style={{ backgroundColor: "var(--color-brand-primary, #0EA5E9)" }}
        >
          {t("help.mock.notes.addButton", "+ 練習を記録する")}
        </button>
      </div>

      <MockBottomNav active={0} />
    </PhoneMockup>
  );
}

/**
 * 試合記録モックアップ
 */
function MatchMockup() {
  const { t } = useTranslation();

  return (
    <PhoneMockup label={t("help.mock.matches.ariaLabel", "試合記録のモックアップ")}>
      <div
        className="px-3 py-2"
        style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
      >
        <span className="text-white text-xs font-bold">{t("help.mock.matches.header", "試合ノート")}</span>
      </div>

      <div className="flex-1 px-2 pt-3 space-y-2">
        {/* 試合カード */}
        <div className="bg-zinc-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-[10px] font-semibold">{t("help.mock.matches.matchName", "春季リーグ第3節")}</span>
            <span className="text-zinc-500 text-[8px]">{t("help.mock.matches.matchDate", "4月12日")}</span>
          </div>
          {/* スコア */}
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
            >
              3
            </span>
            <span className="text-zinc-500 text-xs">-</span>
            <span className="text-zinc-300 text-lg font-bold">1</span>
          </div>
          {/* 星評価 */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-[10px] ${s <= 4 ? "text-yellow-400" : "text-zinc-700"}`}>★</span>
            ))}
          </div>
        </div>

        {/* 振り返りカード */}
        <div className="bg-zinc-900 rounded-xl p-2.5 border border-zinc-800">
          <p className="text-zinc-400 text-[8px] mb-1">{t("help.mock.matches.reviewLabel", "試合後の振り返り")}</p>
          <p className="text-zinc-300 text-[9px] leading-relaxed">{t("help.mock.matches.reviewText", "積極的なドリブルが決まった。次はシュート精度を高めたい。")}</p>
        </div>
      </div>

      <MockBottomNav active={1} />
    </PhoneMockup>
  );
}

/**
 * 家族タイムラインモックアップ
 */
function TimelineMockup() {
  const { t } = useTranslation();

  const reactions = ["👏", "⭐", "💪"];

  return (
    <PhoneMockup label={t("help.mock.timeline.ariaLabel", "家族タイムラインのモックアップ")}>
      <div
        className="px-3 py-2"
        style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
      >
        <span className="text-white text-xs font-bold">{t("help.mock.timeline.header", "家族タイムライン")}</span>
      </div>

      <div className="flex-1 px-2 pt-3 space-y-3">
        {/* タイムラインカード */}
        <div className="bg-zinc-800 rounded-xl p-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center text-[8px] text-white font-bold">太</div>
            <span className="text-zinc-300 text-[9px]">{t("help.mock.timeline.member1", "太郎（本人）")}</span>
            <span className="text-zinc-600 text-[8px] ml-auto">{t("help.mock.timeline.time1", "3時間前")}</span>
          </div>
          <p className="text-white text-[9px] leading-relaxed">{t("help.mock.timeline.post1", "今日のシュート練習、100本達成！")}</p>
          {/* リアクションバー */}
          <div className="flex items-center gap-2 mt-2">
            {reactions.map((r) => (
              <span key={r} className="text-[12px] bg-zinc-700 rounded-full px-1.5 py-0.5 cursor-pointer">{r}</span>
            ))}
          </div>
        </div>

        {/* コメント */}
        <div className="bg-zinc-900 rounded-xl p-2 border border-zinc-800">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-zinc-600 flex items-center justify-center text-[7px] text-white font-bold">母</div>
            <span className="text-zinc-400 text-[8px]">{t("help.mock.timeline.commenter", "お母さん")}</span>
          </div>
          <p className="text-zinc-300 text-[9px]">{t("help.mock.timeline.comment", "すごい！頑張ったね！⭐")}</p>
        </div>
      </div>

      <MockBottomNav active={2} />
    </PhoneMockup>
  );
}

/**
 * カラーテーマ選択モックアップ
 */
function ThemeMockup() {
  const { t } = useTranslation();

  const themes = [
    { name: t("help.mock.theme.theme1", "スカイブルー × ネイビー"), primary: "#0EA5E9", secondary: "#1E3A5F", selected: true },
    { name: t("help.mock.theme.theme2", "ダークレッド × ネイビー"), primary: "#B30024", secondary: "#002244", selected: false },
    { name: t("help.mock.theme.theme3", "レッド × ブラック"), primary: "#E60012", secondary: "#000000", selected: false },
    { name: t("help.mock.theme.theme4", "イエロー × ブラック"), primary: "#FFE500", secondary: "#000000", selected: false },
    { name: t("help.mock.theme.theme5", "グリーン × ゴールド"), primary: "#006934", secondary: "#B2933D", selected: false },
  ];

  return (
    <PhoneMockup label={t("help.mock.theme.ariaLabel", "カラーテーマ選択のモックアップ")}>
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
      >
        <Palette className="w-3 h-3" style={{ color: "var(--color-brand-primary, #0EA5E9)" }} />
        <span className="text-white text-xs font-bold">{t("help.mock.theme.header", "カラーテーマ")}</span>
      </div>

      <div className="px-3 pt-3 pb-2 border-b border-zinc-700">
        <p className="text-zinc-300 text-[9px] font-bold">{t("help.mock.theme.selectLabel", "J-Leagueチームテーマ")}</p>
        <p className="text-zinc-500 text-[8px] mt-0.5">{t("help.mock.theme.planNote", "プレミアムプランで利用可能")}</p>
      </div>

      <div className="py-1 overflow-hidden">
        {themes.map((theme, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-1.5"
            style={theme.selected ? { backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 10%, transparent)" } : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-2.5 h-4 rounded-sm shadow-sm" style={{ backgroundColor: theme.primary }} />
                <span className="w-2.5 h-4 rounded-sm shadow-sm" style={{ backgroundColor: theme.secondary }} />
              </div>
              <span
                className="text-[8px]"
                style={theme.selected ? { color: "var(--color-brand-primary, #0EA5E9)", fontWeight: "bold" } : { color: "#a1a1aa" }}
              >
                {theme.name}
              </span>
            </div>
            {theme.selected && (
              <Check className="w-2.5 h-2.5" style={{ color: "var(--color-brand-primary, #0EA5E9)" }} />
            )}
          </div>
        ))}
        <div className="px-3 py-1 text-center">
          <span className="text-zinc-600 text-[8px]">… {t("help.mock.theme.total", "全20種類")}</span>
        </div>
      </div>

      <MockBottomNav active={3} />
    </PhoneMockup>
  );
}

/**
 * インストールダイアログ風モックアップ
 */
function InstallMockup() {
  const { t } = useTranslation();
  return (
    <PhoneMockup label={t("help.mock.install.ariaLabel", "インストールダイアログのモックアップ")}>
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* 背景（アプリ画面風） */}
        <div
          className="w-full flex-1 flex items-center justify-center opacity-50"
          style={{ backgroundColor: "var(--color-brand-secondary, #1E3A5F)" }}
        >
          <span className="text-4xl font-bold" style={{ color: "var(--color-brand-primary, #0EA5E9)" }}>F</span>
        </div>

        {/* ボトムシート（インストールダイアログ） */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)" }}
            >
              <span className="text-lg font-bold" style={{ color: "var(--color-brand-primary, #0EA5E9)" }}>F</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t("help.mock.install.appName", "FamNote")}</p>
              <p className="text-[9px] text-zinc-500">{t("help.mock.install.appUrl", "app.famnote.com")}</p>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 mb-3">{t("help.mock.install.dialogTitle", "ホーム画面に追加しますか？")}</p>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-xl text-white text-[10px] font-bold"
              style={{ backgroundColor: "var(--color-brand-primary, #0EA5E9)" }}
            >
              {t("help.mock.install.installButton", "追加する")}
            </button>
            <button className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-[10px]">
              {t("help.mock.install.cancelButton", "キャンセル")}
            </button>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

// ========================
// ステップリストコンポーネント
// ========================

/**
 * 番号付き手順ステップリスト
 */
function StepList({ steps }: { steps: HelpStep[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.step} className="flex gap-4 items-start">
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 text-sm"
            style={{
              backgroundColor: "var(--color-brand-primary, #0EA5E9)",
              boxShadow: "0 0 10px color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 30%, transparent)",
            }}
          >
            {step.step}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{step.title}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================
// セクションコンポーネント
// ========================

/**
 * ヘルプページのセクションラッパー
 * スクロールフェードインアニメーション付き
 */
function HelpSection({
  id,
  title,
  subtitle,
  icon,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id={id}
      ref={ref}
      className={`pb-12 mb-12 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* セクション見出し */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2.5 rounded-xl"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 10%, transparent)",
            color: "var(--color-brand-primary, #0EA5E9)",
          }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ========================
// メインページコンポーネント
// ========================

/**
 * ヘルプページのルートコンポーネント
 */
export function HelpPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>("getting-started");

  // 目次アイテムの定義
  const tocItems: HelpTocItem[] = [
    { id: "getting-started", label: t("help.sections.gettingStarted.title", "はじめに"), icon: <BookOpen className="w-4 h-4" /> },
    { id: "notes", label: t("help.sections.notes.title", "練習ノート"), icon: <FileText className="w-4 h-4" /> },
    { id: "matches", label: t("help.sections.matches.title", "試合記録・ジャーナル"), icon: <Trophy className="w-4 h-4" /> },
    { id: "timeline", label: t("help.sections.timeline.title", "家族タイムライン"), icon: <Users className="w-4 h-4" /> },
    { id: "theme", label: t("help.sections.theme.title", "カラーテーマ"), icon: <Palette className="w-4 h-4" /> },
    { id: "install", label: t("help.sections.install.title", "スマホにインストール"), icon: <Smartphone className="w-4 h-4" /> },
    { id: "pricing", label: t("help.sections.pricing.title", "プラン・お支払い"), icon: <CreditCard className="w-4 h-4" /> },
  ];

  useEffect(() => {
    // スクロール位置に応じてアクティブセクションを更新する
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ========================
  // ステップデータ（i18nキー経由）
  // ========================

  const gettingStartedSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.gettingStarted.step1Title", "FamNoteにアクセス"), description: t("help.steps.gettingStarted.step1Description", "ブラウザで app.famnote.com を開きます。") },
    { step: 2, title: t("help.steps.gettingStarted.step2Title", "Googleでログイン"), description: t("help.steps.gettingStarted.step2Description", "「Googleでログイン / 登録」ボタンをタップします。Googleアカウントを選択して認証してください。") },
    { step: 3, title: t("help.steps.gettingStarted.step3Title", "プロフィール設定"), description: t("help.steps.gettingStarted.step3Description", "お名前と担当スポーツを設定します。") },
    { step: 4, title: t("help.steps.gettingStarted.step4Title", "グループを作成・参加"), description: t("help.steps.gettingStarted.step4Description", "新しい家族グループを作るか、招待コードで既存のグループに参加します。") },
  ];

  const notesSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.notes.step1Title", "「練習ノート」タブを開く"), description: t("help.steps.notes.step1Description", "ボトムナビの練習ノートアイコンをタップします。") },
    { step: 2, title: t("help.steps.notes.step2Title", "「練習を記録する」をタップ"), description: t("help.steps.notes.step2Description", "新規ノート作成画面が開きます。") },
    { step: 3, title: t("help.steps.notes.step3Title", "練習内容を入力"), description: t("help.steps.notes.step3Description", "タイトル・スポーツ種目・練習内容・気づきを入力します。") },
    { step: 4, title: t("help.steps.notes.step4Title", "保存して共有"), description: t("help.steps.notes.step4Description", "「公開して保存」で家族タイムラインに投稿されます。") },
  ];

  const matchesSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.matches.step1Title", "「試合ノート」をタップ"), description: t("help.steps.matches.step1Description", "ダッシュボードまたはボトムナビから試合ノートを選びます。") },
    { step: 2, title: t("help.steps.matches.step2Title", "試合前の目標を入力"), description: t("help.steps.matches.step2Description", "試合名・対戦相手・今日の目標を記録します。") },
    { step: 3, title: t("help.steps.matches.step3Title", "試合後に振り返りを記録"), description: t("help.steps.matches.step3Description", "スコア・自己評価・できたこと・課題・気づきを入力します。") },
    { step: 4, title: t("help.steps.matches.step4Title", "ハイライトにピン"), description: t("help.steps.matches.step4Description", "気づきの箇条書きにある📌をタップすると「気づきのかけら」に自動保存されます。") },
  ];

  const timelineSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.timeline.step1Title", "タイムラインタブを開く"), description: t("help.steps.timeline.step1Description", "ボトムナビの家族アイコンをタップします。") },
    { step: 2, title: t("help.steps.timeline.step2Title", "家族の投稿を確認"), description: t("help.steps.timeline.step2Description", "グループメンバー全員の練習・試合記録が時系列で表示されます。") },
    { step: 3, title: t("help.steps.timeline.step3Title", "リアクションを送る"), description: t("help.steps.timeline.step3Description", "👏⭐💪などのリアクションをタップして応援を伝えましょう。") },
    { step: 4, title: t("help.steps.timeline.step4Title", "コメントで応援"), description: t("help.steps.timeline.step4Description", "コメント欄にメッセージを入力して家族を応援できます。") },
  ];

  const themeSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.theme.step1Title", "設定を開く"), description: t("help.steps.theme.step1Description", "プロフィールアイコンから設定画面を開きます。") },
    { step: 2, title: t("help.steps.theme.step2Title", "「カラーテーマ」を選択"), description: t("help.steps.theme.step2Description", "J1リーグ20チームのカラーパレットから好みのテーマを選びます。") },
    { step: 3, title: t("help.steps.theme.step3Title", "テーマを適用"), description: t("help.steps.theme.step3Description", "選択したテーマがアプリ全体に即時反映されます。") },
  ];

  const installAndroidSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.installAndroid.step1Title", "Chromeで開く"), description: t("help.steps.installAndroid.step1Description", "AndroidのChromeブラウザでFamNoteにアクセスします。") },
    { step: 2, title: t("help.steps.installAndroid.step2Title", "メニューを開く"), description: t("help.steps.installAndroid.step2Description", "右上の「⋮」メニューをタップします。") },
    { step: 3, title: t("help.steps.installAndroid.step3Title", "「ホーム画面に追加」"), description: t("help.steps.installAndroid.step3Description", "「ホーム画面に追加」または「アプリをインストール」を選択します。") },
    { step: 4, title: t("help.steps.installAndroid.step4Title", "インストール完了"), description: t("help.steps.installAndroid.step4Description", "ホーム画面にFamNoteのアイコンが追加されます。") },
  ];

  const installIosSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.installIos.step1Title", "Safariで開く"), description: t("help.steps.installIos.step1Description", "iPhoneのSafariブラウザでFamNoteにアクセスします。") },
    { step: 2, title: t("help.steps.installIos.step2Title", "共有メニューをタップ"), description: t("help.steps.installIos.step2Description", "画面下部の共有アイコン（□↑）をタップします。") },
    { step: 3, title: t("help.steps.installIos.step3Title", "「ホーム画面に追加」"), description: t("help.steps.installIos.step3Description", "「ホーム画面に追加」をタップして完了です。") },
  ];

  const pricingSteps: HelpStep[] = [
    { step: 1, title: t("help.steps.pricing.step1Title", "プロフィール → 設定を開く"), description: t("help.steps.pricing.step1Description", "プロフィールアイコンから設定画面を開きます。") },
    { step: 2, title: t("help.steps.pricing.step2Title", "「プランをアップグレード」をタップ"), description: t("help.steps.pricing.step2Description", "月額・年額プランを選択します。年額は2ヶ月分お得です。") },
    { step: 3, title: t("help.steps.pricing.step3Title", "支払い情報を入力"), description: t("help.steps.pricing.step3Description", "Stripe決済でクレジットカード情報を安全に入力します。支払い後すぐに利用開始できます。") },
  ];

  // プラン比較テーブルデータ
  const planCompareRows = [
    { feature: t("help.planCompare.practiceNotes", "練習ノート記録"), free: t("help.planCompare.unlimited", "無制限"), premium: t("help.planCompare.unlimited", "無制限") },
    { feature: t("help.planCompare.matchJournal", "試合ジャーナル"), free: t("help.planCompare.unlimited", "無制限"), premium: t("help.planCompare.unlimited", "無制限") },
    { feature: t("help.planCompare.familyTimeline", "家族タイムライン"), free: t("help.planCompare.upTo10", "最大10名"), premium: t("help.planCompare.upTo10", "最大10名") },
    { feature: t("help.planCompare.goalManagement", "目標設定・管理"), free: t("help.planCompare.available", "利用可"), premium: t("help.planCompare.available", "利用可") },
    { feature: t("help.planCompare.theme", "J-Leagueテーマ"), free: t("help.planCompare.unavailable", "利用不可"), premium: t("help.planCompare.colors20", "20チーム") },
    { feature: t("help.planCompare.advancedCharts", "高度なグラフ"), free: t("help.planCompare.unavailable", "利用不可"), premium: t("help.planCompare.available", "利用可") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 scroll-smooth">
      {/* 共通ヘッダー */}
      <LegalHeader />

      {/* ヒーローセクション */}
      <HelpHero />

      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* サイドバー目次（デスクトップのみ表示） */}
          <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="目次">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                {t("help.toc", "目次")}
              </p>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                      activeSection === item.id
                        ? "font-medium"
                        : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                    style={
                      activeSection === item.id
                        ? {
                            backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 10%, transparent)",
                            color: "var(--color-brand-primary, #0EA5E9)",
                          }
                        : undefined
                    }
                  >
                    <span
                      style={
                        activeSection === item.id
                          ? { color: "var(--color-brand-primary, #0EA5E9)" }
                          : { color: "#52525b" }
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <article className="flex-1 min-w-0">

            {/* ---- はじめに ---- */}
            <HelpSection
              id="getting-started"
              title={t("help.sections.gettingStarted.title", "はじめに")}
              subtitle={t("help.sections.gettingStarted.subtitle", "アカウント登録とログイン")}
              icon={<BookOpen className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.gettingStarted.description", "FamNoteはGoogleアカウントで簡単に始められます。登録・ログインはワンタップで完了し、すぐに家族グループを作成して使い始められます。")}
                  </p>
                  <StepList steps={gettingStartedSteps} />
                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t("help.sections.gettingStarted.logoutLabel", "ログアウト：")}</span>{" "}
                      {t("help.sections.gettingStarted.logoutNote", "プロフィール画面の設定から行えます。データはクラウドに保存されるため、再ログインしてもすべての記録が復元されます。")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <LoginMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- 練習ノート ---- */}
            <HelpSection
              id="notes"
              title={t("help.sections.notes.title", "練習ノート")}
              subtitle={t("help.sections.notes.subtitle", "毎日の練習内容を記録・共有")}
              icon={<FileText className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.notes.description", "練習内容・気づき・改善点をノートに記録します。継続して記録することで成長の軌跡が残り、家族タイムラインにも共有されます。")}
                  </p>
                  <StepList steps={notesSteps} />
                </div>
                <div className="flex justify-center">
                  <NotesMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- 試合記録・ジャーナル ---- */}
            <HelpSection
              id="matches"
              title={t("help.sections.matches.title", "試合記録・ジャーナル")}
              subtitle={t("help.sections.matches.subtitle", "試合前後の目標設定と振り返り")}
              icon={<Trophy className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.matches.description", "試合前に目標を立て、試合後に振り返ることで学びが深まります。気づきのハイライト機能で重要な気づきを自動保存します。")}
                  </p>
                  <StepList steps={matchesSteps} />
                </div>
                <div className="flex justify-center">
                  <MatchMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- 家族タイムライン ---- */}
            <HelpSection
              id="timeline"
              title={t("help.sections.timeline.title", "家族タイムライン")}
              subtitle={t("help.sections.timeline.subtitle", "家族みんなで応援・共有")}
              icon={<Users className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.timeline.description", "グループ全員の練習・試合記録がリアルタイムで共有されます。リアクションやコメントで離れた場所からでも応援できます。")}
                  </p>
                  <StepList steps={timelineSteps} />
                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t("help.sections.timeline.tipLabel", "ヒント：")}</span>{" "}
                      {t("help.sections.timeline.tipBody", "「下書き保存」した記録はタイムラインには公開されません。家族に共有したいときだけ「公開して保存」を使いましょう。")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <TimelineMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- カラーテーマ ---- */}
            <HelpSection
              id="theme"
              title={t("help.sections.theme.title", "カラーテーマ")}
              subtitle={t("help.sections.theme.subtitle", "J-Leagueチームカラーでカスタマイズ")}
              icon={<Palette className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.theme.description", "J1リーグ全20チームのカラーパレットをアプリに適用できます。お気に入りのチームカラーで日々の記録をより楽しく。")}
                  </p>
                  <StepList steps={themeSteps} />
                  <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 5%, transparent)", borderColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)" }}>
                    <p className="text-sm" style={{ color: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 80%, #000)" }}>
                      <span className="font-semibold">{t("help.sections.theme.noteLabel", "プレミアム限定：")}</span>{" "}
                      {t("help.sections.theme.noteBody", "カラーテーマ機能はプレミアムプラン（月額500円）でご利用いただけます。")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <ThemeMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- スマホにインストール ---- */}
            <HelpSection
              id="install"
              title={t("help.sections.install.title", "スマホにインストール")}
              subtitle={t("help.sections.install.subtitle", "ホーム画面に追加してアプリとして使う")}
              icon={<Smartphone className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                    {t("help.sections.install.description", "FamNoteはPWA対応のWebアプリです。ホーム画面に追加することで、ネイティブアプリのように快適に使えます。")}
                  </p>

                  {/* Android手順 */}
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded">Android</span>
                    Chrome
                  </h3>
                  <StepList steps={installAndroidSteps} />

                  {/* iOS手順 */}
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3 mt-8 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-zinc-700 text-white px-1.5 py-0.5 rounded">iOS</span>
                    Safari
                  </h3>
                  <StepList steps={installIosSteps} />

                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t("help.sections.install.noteLabel", "注意：")}</span>{" "}
                      {t("help.sections.install.noteBody", "インストール後もデータはクラウドに保存されます。アプリを削除してもデータは失われません。")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <InstallMockup />
                </div>
              </div>
            </HelpSection>

            {/* ---- プラン・お支払い ---- */}
            <HelpSection
              id="pricing"
              title={t("help.sections.pricing.title", "プラン・お支払い")}
              subtitle={t("help.sections.pricing.subtitle", "プランの変更とアップグレード")}
              icon={<CreditCard className="w-5 h-5" />}
            >
              {/* プラン比較テーブル */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="py-3 px-4 text-left text-zinc-500 dark:text-zinc-400 font-medium">{t("help.sections.pricing.tableFeature", "機能")}</th>
                      <th className="py-3 px-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold">{t("help.planCompare.freePlan", "無料プラン")}</th>
                      <th
                        className="py-3 px-4 text-center font-semibold"
                        style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
                      >
                        {t("help.planCompare.premiumPlan", "プレミアムプラン")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planCompareRows.map((row) => (
                      <tr
                        key={row.feature}
                        className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{row.feature}</td>
                        <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-500">{row.free}</td>
                        <td
                          className="py-3 px-4 text-center font-medium"
                          style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
                        >
                          {row.premium}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                    {t("help.sections.pricing.upgradeTitle", "アップグレード手順")}
                  </h3>
                  <StepList steps={pricingSteps} />
                </div>
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                    {t("help.sections.pricing.planInfoTitle", "プランについて")}
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t("help.sections.pricing.planInfo1", "月額プラン：500円（税込）/ 月")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t("help.sections.pricing.planInfo2", "年額プラン：5,000円（税込）/ 年（2ヶ月分お得）")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{t("help.sections.pricing.planInfo3", "いつでもキャンセル可能。解約後は期間終了まで利用継続。")}</span>
                    </li>
                  </ul>
                  <Link
                    to="/pricing"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
                  >
                    {t("help.sections.pricing.viewPlans", "料金プランを確認する")}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </HelpSection>

          </article>
        </div>
      </main>

      {/* 共通フッター */}
      <LegalFooter />
    </div>
  );
}
