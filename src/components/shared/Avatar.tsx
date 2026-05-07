import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

// アバターコンポーネント
export function Avatar({ src, name, size = 'md', className, showOnlineIndicator, isOnline }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  // 名前からイニシャルを生成
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : null;

  // 背景クラスの決定ロジック
  // 画像あり: 中立背景（画像で覆われるため）
  // イニシャルあり: グラデーション背景（デザイン仕様書準拠）
  // アイコン表示: 中立背景
  const bgClass = src
    ? 'bg-zinc-700'
    : initials
      ? 'bg-gradient-to-br from-sky-400 to-blue-600'
      : 'bg-zinc-700';

  return (
    <div className={clsx('relative inline-flex', className)}>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center overflow-hidden shrink-0',
          bgClass,
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name ?? 'アバター'}
            className="w-full h-full object-cover"
            // XSS対策: crossOriginを設定
            crossOrigin="anonymous"
          />
        ) : initials ? (
          <span className="font-semibold text-white">{initials}</span>
        ) : (
          <User className="text-zinc-400 w-1/2 h-1/2" />
        )}
      </div>

      {/* オンラインインジケーター */}
      {showOnlineIndicator && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950',
            isOnline ? 'bg-green-500' : 'bg-zinc-600'
          )}
        />
      )}
    </div>
  );
}
