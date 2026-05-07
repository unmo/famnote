import { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

interface AvatarUploadProps {
  /** 現在のアバター画像URL（nullの場合はイニシャル表示） */
  src: string | null;
  /** アバターに表示するメンバー名（イニシャル生成に使用） */
  name: string;
  /** アップロード先グループID */
  groupId: string;
  /** アップロード先メンバーID */
  memberId: string;
  /** コンポーネントサイズ（デフォルト: 'lg'） */
  size?: 'lg' | 'xl';
  /** 追加のCSSクラス */
  className?: string;
}

// アバターサイズの定義（px）
const SIZE_PX = { lg: 56, xl: 80 } as const;

// SVG プログレスリングのコンポーネント
function ProgressRing({ progress, size }: { progress: number; size: 56 | 80 }) {
  const radius = size === 56 ? 22 : 32;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
      aria-hidden="true"
    >
      {/* 背景トラック */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
      />
      {/* プログレスリング */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
      {/* プログレス数値 */}
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="Inter, sans-serif"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

// 削除確認ダイアログ
function DeleteConfirmDialog({
  name,
  src,
  isDeleting,
  onConfirm,
  onClose,
  cancelButtonRef,
}: {
  name: string;
  src: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
  cancelButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return createPortal(
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl shadow-black/40
                   flex flex-col gap-4 items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        {/* アバタープレビュー */}
        <Avatar src={src} name={name} size="sm" />

        {/* 見出し */}
        <p id="delete-dialog-title" className="text-base font-semibold text-zinc-50">
          プロフィール画像を削除しますか？
        </p>
        <p id="delete-dialog-description" className="text-sm text-zinc-400">
          この操作は元に戻せません。
        </p>

        {/* ボタン行 */}
        <div className="flex gap-3 w-full">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            autoFocus
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium
                       hover:bg-zinc-800 hover:text-zinc-50 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
            aria-disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium
                       hover:bg-red-500/30 transition-colors border border-red-500/20
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg
                  className="animate-spin w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                削除中...
              </span>
            ) : (
              '削除する'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// タップ可能なアバター UI（プログレス + 削除ボタン付き）
export function AvatarUpload({ src, name, groupId, memberId, size = 'lg', className }: AvatarUploadProps) {
  const { uploadState, handleFileSelect, handleDelete } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { isUploading, progress } = uploadState;
  const sizePx = SIZE_PX[size];

  // ファイル選択ダイアログを開く
  const openFilePicker = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      handleFileSelect(file, groupId, memberId);
      // 同一ファイルの再選択を可能にするためリセット
      e.target.value = '';
    },
    [handleFileSelect, groupId, memberId]
  );

  const openDeleteDialog = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isUploading && src) {
        setIsDeleteDialogOpen(true);
      }
    },
    [isUploading, src]
  );

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    // ダイアログを閉じたらフォーカスを削除ボタンに戻す
    requestAnimationFrame(() => {
      deleteButtonRef.current?.focus();
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!src) return;
    await handleDelete(groupId, memberId, src);
    setIsDeleteDialogOpen(false);
  }, [handleDelete, groupId, memberId, src]);

  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ''}`}>
      {/* クリッカブルなアバター領域 */}
      <div className="relative">
        <motion.button
          type="button"
          onClick={openFilePicker}
          whileHover={isUploading ? undefined : { scale: 1.03 }}
          whileTap={isUploading ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15 }}
          disabled={isUploading}
          aria-label={`${name}のプロフィール画像を変更`}
          aria-busy={isUploading}
          className={`relative cursor-pointer group rounded-full
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                      focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
                      ${isUploading ? 'pointer-events-none' : ''}`}
        >
          {/* アバター本体（src 変化時に key で再マウントしてアニメーションを発火） */}
          <motion.div
            key={src ?? 'no-avatar'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
          >
            <Avatar src={src} name={name} size={size} />
          </motion.div>

          {/* ホバーオーバーレイ（アップロード中は非表示） */}
          {!isUploading && (
            <div
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-hidden="true"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}

          {/* アップロード中オーバーレイ */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                key="upload-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center z-10"
                aria-hidden="true"
              >
                <ProgressRing progress={progress} size={sizePx as 56 | 80} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* カメラバッジ（右下・通常時のみ） */}
          {!isUploading && (
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-zinc-900/80 border border-zinc-700
                         flex items-center justify-center"
              aria-hidden="true"
            >
              <Camera className="w-3 h-3 text-zinc-300" />
            </div>
          )}
        </motion.button>

        {/* 削除ボタン（右上・画像あり時のみ） */}
        <AnimatePresence>
          {src && !isUploading && (
            <motion.button
              key="delete-button"
              ref={deleteButtonRef}
              type="button"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, delay: 0.1 } }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.15 } }}
              onClick={openDeleteDialog}
              aria-label={`${name}のプロフィール画像を削除`}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-900/90 border border-zinc-700
                         flex items-center justify-center
                         hover:border-red-500/30 hover:bg-red-500/20 transition-colors duration-150
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                         -m-2 p-2"
            >
              <X className="w-3 h-3 text-zinc-400 hover:text-red-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 「写真を変更」ラベル */}
      <span className="mt-1 text-xs text-zinc-400 text-center select-none" aria-hidden="true">
        写真を変更
      </span>

      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 削除確認ダイアログ */}
      <AnimatePresence>
        {isDeleteDialogOpen && src && (
          <DeleteConfirmDialog
            name={name}
            src={src}
            isDeleting={isUploading}
            onConfirm={confirmDelete}
            onClose={closeDeleteDialog}
            cancelButtonRef={cancelButtonRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
