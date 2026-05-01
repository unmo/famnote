import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Mail } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'FamNoteは無料で使えますか？',
    a: 'はい、基本機能（練習ノート・試合記録・家族タイムライン・目標設定・ハイライト）はすべて無料でご利用いただけます。J-Leagueチームカラーテーマや高度なグラフ機能はプレミアムプラン（月額500円）でご利用いただけます。',
  },
  {
    q: '家族で使うにはどうすればいいですか？',
    a: 'Googleアカウントでサインアップ後、グループを作成してください。グループ作成後に表示される招待コードを家族に共有することで、同じグループに参加できます。',
  },
  {
    q: '子供のプロフィールはいくつ作れますか？',
    a: '1つのグループ内で複数の子供プロフィールを作成できます。ログイン後のプロフィール選択画面から切り替えて利用できます。',
  },
  {
    q: '記録したデータは削除されますか？',
    a: 'アカウントを退会しない限り、記録したデータは削除されません。退会する場合はサポートへお問い合わせください。',
  },
  {
    q: 'プレミアムプランはいつでもキャンセルできますか？',
    a: 'はい、マイページの設定からいつでもキャンセルできます。キャンセル後は当月（または当年）の期間終了まで引き続きプレミアム機能をご利用いただけます。',
  },
  {
    q: 'パスワードを忘れました',
    a: 'FamNoteはGoogleアカウントでログインします。パスワードの管理はGoogleアカウントの設定から行ってください。',
  },
  {
    q: 'スマートフォンからも使えますか？',
    a: 'はい、スマートフォンのブラウザから快適にご利用いただけます。モバイルファーストで設計されており、iOS・Androidの両方に対応しています。',
  },
  {
    q: '対応しているスポーツを教えてください',
    a: 'サッカー・野球・バスケットボール・バレーボール・テニス・水泳・陸上・体操など20種類以上のスポーツに対応しています。',
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-zinc-900/50 transition-colors"
      >
        <span className="text-sm font-medium text-zinc-100">{item.q}</span>
        {open ? (
          <ChevronUp size={16} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-zinc-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4 bg-zinc-900/30">
          {item.a}
        </div>
      )}
    </div>
  );
}

export function HelpPage() {
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
        <h1 className="text-2xl font-bold mb-2">ヘルプ</h1>
        <p className="text-zinc-400 text-sm mb-10">よくあるご質問と使い方をご案内します。</p>

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqAccordion key={item.q} item={item} />
            ))}
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <Mail size={24} className="mx-auto mb-3 text-[var(--color-brand-primary,#E85513)]" />
          <h2 className="text-base font-semibold mb-2">解決しない場合はお問い合わせください</h2>
          <p className="text-zinc-400 text-sm mb-4">
            サポートチームが対応いたします。
          </p>
          <a
            href="mailto:support@fam-grow.com"
            className="inline-flex items-center gap-2 btn-primary text-sm"
          >
            <Mail size={14} />
            support@fam-grow.com
          </a>
        </section>
      </main>
    </div>
  );
}
