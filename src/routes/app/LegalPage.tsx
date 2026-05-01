import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function LegalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-zinc-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary,#E85513)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-bold">FamNote</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">特定商取引法に基づく表示</h1>

        <div className="space-y-0 divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
          {[
            { label: '販売業者', value: '※事業者名を記載' },
            { label: '代表者名', value: '※代表者名を記載' },
            { label: '所在地', value: '※所在地を記載' },
            { label: '電話番号', value: '※電話番号を記載（お問い合わせはメールにて受け付けています）' },
            { label: 'メールアドレス', value: 'support@fam-grow.com' },
            { label: '販売価格', value: 'プレミアムプラン：月額500円（税込）／年額5,000円（税込）' },
            { label: '支払方法', value: 'クレジットカード（Stripe決済）' },
            { label: '支払時期', value: 'お申し込み時に即時決済。月額プランは毎月自動更新、年額プランは毎年自動更新。' },
            { label: 'サービス提供時期', value: 'お支払い完了後、即時利用可能。' },
            { label: 'キャンセル・返金について', value: 'いつでもマイページよりキャンセル可能。解約後は当該期間終了まで引き続きご利用いただけます。既に支払済みの料金の返金は原則として行いません。' },
            { label: '動作環境', value: 'インターネット接続環境が必要です。最新版のChrome・Safari・Edge・Firefoxを推奨します。' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row">
              <dt className="w-full sm:w-48 shrink-0 bg-zinc-900 px-4 py-4 text-sm font-medium text-zinc-300">
                {label}
              </dt>
              <dd className="flex-1 px-4 py-4 text-sm text-zinc-400 leading-relaxed">
                {value}
              </dd>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-600">最終更新日：2026年5月1日</p>
      </main>
    </div>
  );
}
