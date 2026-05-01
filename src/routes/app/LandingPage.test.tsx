import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

// jsdom環境ではIntersectionObserverが未定義のためモック
beforeAll(() => {
  const mockIntersectionObserver = vi.fn().mockImplementation((callback: IntersectionObserverCallback) => ({
    observe: vi.fn(() => {
      // 即座にintersecting状態を発火させてカウントアップアニメーションをトリガー
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
});

// react-router の Link は MemoryRouter 内でのみ動作するためラッパーを使用
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LandingPage', () => {
  describe('正常系: セクション存在確認', () => {
    it('landing-header が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-header')).toBeInTheDocument();
    });

    it('landing-hero が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-hero')).toBeInTheDocument();
    });

    it('landing-social-proof が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-social-proof')).toBeInTheDocument();
    });

    it('landing-features が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-features')).toBeInTheDocument();
    });

    it('landing-how-it-works が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-how-it-works')).toBeInTheDocument();
    });

    it('landing-pricing が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-pricing')).toBeInTheDocument();
    });

    it('landing-cta が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-cta')).toBeInTheDocument();
    });

    it('landing-footer が存在すること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByTestId('landing-footer')).toBeInTheDocument();
    });

    it('8つのセクションがすべてレンダリングされること', () => {
      renderWithRouter(<LandingPage />);
      const testIds = [
        'landing-header',
        'landing-hero',
        'landing-social-proof',
        'landing-features',
        'landing-how-it-works',
        'landing-pricing',
        'landing-cta',
        'landing-footer',
      ];
      testIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeInTheDocument();
      });
    });
  });

  describe('正常系: リンク確認', () => {
    it('「無料で始める」ボタンが /signup にリンクしていること（ヘッダー）', () => {
      renderWithRouter(<LandingPage />);
      // ヘッダー内の signup リンクを確認
      const header = screen.getByTestId('landing-header');
      const signupLinks = header.querySelectorAll('a[href="/signup"]');
      expect(signupLinks.length).toBeGreaterThan(0);
    });

    it('「ログイン」リンクが /login にリンクしていること', () => {
      renderWithRouter(<LandingPage />);
      const loginLinks = document.querySelectorAll('a[href="/login"]');
      expect(loginLinks.length).toBeGreaterThan(0);
    });

    it('ヒーローセクションに /signup へのリンクが存在すること', () => {
      renderWithRouter(<LandingPage />);
      const hero = screen.getByTestId('landing-hero');
      const signupLinks = hero.querySelectorAll('a[href="/signup"]');
      expect(signupLinks.length).toBeGreaterThan(0);
    });
  });

  describe('正常系: i18n キー表示確認', () => {
    it('ヒーローセクションに heroTitle キーが表示されること', () => {
      renderWithRouter(<LandingPage />);
      // i18next モックはキー名をそのまま返す
      expect(screen.getByText('landing.heroTitle')).toBeInTheDocument();
    });

    it('ヒーローセクションに heroTitleAccent キーが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('landing.heroTitleAccent')).toBeInTheDocument();
    });

    it('フィーチャーセクションタイトルが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('landing.featuresSectionTitle')).toBeInTheDocument();
    });

    it('How it worksセクションタイトルが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('landing.howItWorksSectionTitle')).toBeInTheDocument();
    });

    it('料金プランセクションタイトルが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('landing.pricingSectionTitle')).toBeInTheDocument();
    });

    it('最終CTAタイトルが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('landing.ctaFinalTitle')).toBeInTheDocument();
    });
  });

  describe('正常系: LanguageSwitcher の存在確認', () => {
    it('LanguageSwitcher が複数箇所（ヘッダー・フッター）にレンダリングされること', () => {
      renderWithRouter(<LandingPage />);
      // LanguageSwitcher は Globe アイコンと言語表示テキストを持つ
      // i18n モックで language: 'ja' → 'ja' というテキストが複数あることを確認
      const langTexts = screen.getAllByText('ja');
      expect(langTexts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('異常系', () => {
    it('i18nキーが未定義でもクラッシュしないこと', () => {
      // i18next モックはキー名をフォールバックで返すため、クラッシュしない
      expect(() => renderWithRouter(<LandingPage />)).not.toThrow();
    });
  });

  describe('正常系: 料金プランCTAボタン', () => {
    it('「今すぐ始める」ボタンが表示されること', () => {
      renderWithRouter(<LandingPage />);
      // landing.startFreePlan キーが表示される
      expect(screen.getByText('landing.startFreePlan')).toBeInTheDocument();
    });

    it('「プレミアムを始める」ボタンが表示されること', () => {
      renderWithRouter(<LandingPage />);
      // landing.startPremiumPlan キーが表示される
      expect(screen.getByText('landing.startPremiumPlan')).toBeInTheDocument();
    });
  });

  describe('正常系: FamNoteロゴ', () => {
    it('ヘッダーに FamNote ロゴテキストが表示されること', () => {
      renderWithRouter(<LandingPage />);
      expect(screen.getByText('FamNote')).toBeInTheDocument();
    });
  });
});
