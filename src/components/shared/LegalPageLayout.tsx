/**
 * 法的ページ共通レイアウトコンポーネント
 * 特定商取引法・ヘルプなどの法的ページで共用する
 */
import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, ArrowLeft, Link2 } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

// ========================
// 型定義
// ========================

/** 目次アイテムの型定義 */
export interface TocItem {
  id: string;
  label: string;
}

/** LegalPageLayout のプロパティ定義 */
interface LegalPageLayoutProps {
  /** ページタイトル（ヒーローに表示） */
  pageTitle: string;
  /** ページアイコン（Lucideコンポーネント） */
  icon: ReactNode;
  /** 最終更新日テキスト */
  lastUpdated: string;
  /** 目次ラベル */
  tocLabel: string;
  /** 目次アイテム一覧 */
  tocItems: TocItem[];
  /** メインコンテンツ */
  children: ReactNode;
}

// ========================
// FamNoteロゴコンポーネント
// ========================

/**
 * FamNoteロゴ（オレンジ四角に「F」）
 */
function FamNoteLogo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--color-brand-primary, #0EA5E9)" }}
      >
        <span className="text-white font-bold text-sm leading-none">F</span>
      </div>
      <span className="text-base font-bold text-white tracking-wide">
        Fam<span style={{ color: "var(--color-brand-primary, #0EA5E9)" }}>Note</span>
      </span>
    </div>
  );
}

// ========================
// ヘッダーコンポーネント
// ========================

/**
 * 法的ページ共通ヘッダー
 * sticky、スクロールでbackdrop-blur切替
 */
export function LegalHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // スクロール量を監視して背景を切り替える
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link to="/" className="group">
          <FamNoteLogo />
        </Link>

        {/* 右側ナビ */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("legal.backToTop", "← トップに戻る")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

// ========================
// フッターコンポーネント
// ========================

/**
 * 法的ページ共通フッター
 * FamNoteロゴ + ナビリンク + LanguageSwitcher + コピーライト
 */
export function LegalFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-zinc-950 border-t border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* ロゴ */}
          <FamNoteLogo />

          {/* リンク群 */}
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6" aria-label="法的ページナビゲーション">
            <Link
              to="/terms"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {t("landing.footerTerms", "利用規約")}
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {t("landing.footerPrivacy", "プライバシーポリシー")}
            </Link>
            <Link
              to="/legal"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {t("legal.navTitle", "特定商取引法に基づく表示")}
            </Link>
            <Link
              to="/help"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {t("help.pageTitle", "ヘルプ")}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>

        {/* コピーライト */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            {t("legal.copyright", "©2026 FamNote / FamGrow")}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ========================
// メインレイアウトコンポーネント
// ========================

/**
 * 法的ページ共通レイアウト
 * ヒーローバナー + サイドバー目次 + メインコンテンツ + フッター
 */
export function LegalPageLayout({
  pageTitle,
  icon,
  lastUpdated,
  tocLabel,
  tocItems,
  children,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");

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
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  /** 目次リンクをクリックしてスムーズスクロールする */
  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 scroll-smooth">
      {/* ヘッダー */}
      <LegalHeader />

      {/* ヒーローバナー */}
      <section className="relative bg-zinc-950 pt-24 pb-16 overflow-hidden">
        {/* グロー装飾 */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 10%, transparent)" }}
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
            <span className="text-zinc-300">{pageTitle}</span>
          </nav>

          {/* ページタイトル */}
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-2xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary, #0EA5E9) 20%, transparent)", color: "var(--color-brand-primary, #0EA5E9)" }}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* サイドバー目次（デスクトップのみ表示） */}
          <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="目次">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                {tocLabel}
              </p>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors duration-200 ${
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
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <article className="flex-1 min-w-0">
            {children}
          </article>
        </div>
      </main>

      {/* フッター */}
      <LegalFooter />
    </div>
  );
}

// ========================
// セクションコンポーネント
// ========================

/**
 * 法的ページのセクションコンポーネント
 * アンカーリンク付き見出し + 本文コンテンツ
 */
interface LegalSectionProps {
  /** セクションのHTML id（アンカーリンク用） */
  id: string;
  /** セクション見出し */
  title: string;
  /** セクション本文 */
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="pb-10 mb-10 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
    >
      {/* 見出し（ホバー時にアンカーアイコン表示） */}
      <div className="flex items-center gap-2 group mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 dark:text-zinc-500 hover:text-[var(--color-brand-primary,#0EA5E9)]"
          aria-label={`${title}へのリンク`}
        >
          <Link2 className="w-4 h-4" />
        </a>
      </div>

      {/* 本文 */}
      <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

// ========================
// テーブル行コンポーネント
// ========================

/**
 * 特定商取引法テーブル行コンポーネント
 */
interface LegalTableRowProps {
  label: string;
  children: ReactNode;
}

export function LegalTableRow({ label, children }: LegalTableRowProps) {
  return (
    <div className="flex flex-col sm:flex-row border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
      <dt className="sm:w-48 flex-shrink-0 py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900">
        {label}
      </dt>
      <dd className="flex-1 py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {children}
      </dd>
    </div>
  );
}
