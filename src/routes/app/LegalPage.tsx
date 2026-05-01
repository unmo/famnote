import { Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';

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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[color-mix(in_srgb,var(--color-brand-primary,#E85513)_15%,transparent)] rounded-xl">
            <Store size={20} className="text-[var(--color-brand-primary,#E85513)]" />
          </div>
          <h1 className="text-2xl font-bold">特定商取引法に基づく表示</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-8">最終更新日：2026年5月1日</p>

        <p className="text-sm text-zinc-300 leading-relaxed mb-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          特定商取引法第11条の規定に基づき、以下の事項を表示します。
        </p>

        <div className="rounded-xl border border-zinc-800 overflow-hidden mb-8">
          {[
            {
              label: '販売業者',
              value: 'FamGrow',
            },
            {
              label: '代表者名',
              value: '※請求に応じて遅滞なく開示します',
            },
            {
              label: '所在地',
              value: '※請求に応じて遅滞なく開示します',
            },
            {
              label: '電話番号',
              value: (
                <span className="text-zinc-400">
                  お問い合わせはメールにて受け付けています：
                  <a href="mailto:contact@fam-grow.com" className="text-[var(--color-brand-primary,#E85513)] hover:underline ml-1">
                    contact@fam-grow.com
                  </a>
                </span>
              ),
            },
            {
              label: 'メールアドレス',
              value: (
                <a href="mailto:contact@fam-grow.com" className="text-[var(--color-brand-primary,#E85513)] hover:underline">
                  contact@fam-grow.com
                </a>
              ),
            },
            {
              label: 'サービス名',
              value: 'FamNote',
            },
            {
              label: '販売価格',
              value: (
                <ul className="space-y-1">
                  <li><strong>無料プラン：</strong>無料</li>
                  <li><strong>プレミアムプラン：</strong>月額500円（税込）／年額5,000円（税込）</li>
                </ul>
              ),
            },
            {
              label: '支払方法',
              value: (
                <>
                  クレジットカード（Stripe決済）<br />
                  <span className="text-xs text-zinc-500">Visa / Mastercard / American Express / JCB</span>
                </>
              ),
            },
            {
              label: '支払時期',
              value: 'お申し込み時に即時決済。月額プランは毎月、年額プランは毎年自動更新。',
            },
            {
              label: 'サービス提供時期',
              value: 'お支払い完了後、即時利用可能。',
            },
            {
              label: 'キャンセル・返金について',
              value: (
                <>
                  <p>マイページの設定からいつでも解約できます。解約後は当該契約期間の終了日まで引き続きご利用いただけます。</p>
                  <p className="mt-1">既にお支払い済みの料金の返金は、法令に定める場合を除き原則として行いません。</p>
                </>
              ),
            },
            {
              label: '動作環境',
              value: (
                <>
                  インターネット接続環境が必要です。<br />
                  <span className="text-xs text-zinc-500">最新版のChrome・Safari・Edge・Firefoxを推奨します。</span>
                </>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border-b border-zinc-800 last:border-b-0">
              <dt className="w-full sm:w-48 shrink-0 bg-zinc-900 px-4 py-4 text-sm font-medium text-zinc-300">
                {label}
              </dt>
              <dd className="flex-1 px-4 py-4 text-sm text-zinc-400 leading-relaxed">
                {value}
              </dd>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 text-zinc-200">補足事項</h2>
          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <p>本サービスは日本国内の法令に基づき運営しています。</p>
            <p>
              ご不明な点は{' '}
              <a href="mailto:contact@fam-grow.com" className="text-[var(--color-brand-primary,#E85513)] hover:underline">
                contact@fam-grow.com
              </a>
              {' '}までお問い合わせください。
            </p>
            <p>本表示は予告なく変更する場合があります。最新の内容は本ページをご確認ください。</p>
          </div>
        </section>

        <p className="text-xs text-zinc-600 text-right">
          制定：2026年5月1日<br />
          FamGrow
        </p>
      </main>
    </div>
  );
}
