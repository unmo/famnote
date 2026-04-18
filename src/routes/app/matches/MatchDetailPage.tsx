import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, Trash2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMatch, useDeleteMatch } from '@/hooks/useMatches';
import { useAuthStore } from '@/store/authStore';
import { SportBadge } from '@/components/shared/SportBadge';
import { formatDateJa } from '@/lib/utils/date';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { clsx } from 'clsx';
import { useState } from 'react';

// 勝敗別スタイル
const resultStyles = {
  win: { bg: 'bg-green-950/50 border-green-800', text: 'text-green-400', label: '勝ち' },
  draw: { bg: 'bg-amber-950/50 border-amber-800', text: 'text-amber-400', label: '引き分け' },
  loss: { bg: 'bg-red-950/50 border-red-800', text: 'text-red-400', label: '負け' },
};

// 試合記録詳細ページ
export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { data: match, isLoading } = useMatch(id);
  const deleteMatch = useDeleteMatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = match?.userId === userProfile?.uid;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">試合記録が見つかりません</p>
      </div>
    );
  }

  const resultStyle = match.result ? resultStyles[match.result] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={24} />
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/matches/${match.id}/edit`}
              className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="編集"
            >
              <Edit2 size={20} />
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
              aria-label="削除"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* スコアボード */}
        <div
          className={clsx(
            'rounded-2xl border p-6 text-center',
            resultStyle ? resultStyle.bg : 'bg-zinc-900 border-zinc-800'
          )}
        >
          <div className="flex items-center gap-3 justify-center mb-1">
            <SportBadge sport={match.sport} size="sm" />
            <span className="text-zinc-400 text-sm">{formatDateJa(match.date)}</span>
          </div>
          <p className="text-zinc-50 text-lg font-semibold mb-3">vs {match.opponent}</p>

          {(match.myScore !== null || match.opponentScore !== null) && (
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-5xl font-extrabold text-zinc-50">
                {match.myScore ?? '-'}
              </span>
              <span className="text-2xl text-zinc-500">:</span>
              <span className="text-5xl font-extrabold text-zinc-50">
                {match.opponentScore ?? '-'}
              </span>
            </div>
          )}

          {resultStyle && (
            <span className={clsx('text-lg font-bold', resultStyle.text)}>
              {resultStyle.label}
            </span>
          )}
        </div>

        {/* 詳細情報 */}
        <div className="grid grid-cols-2 gap-3">
          {match.venue && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">会場</p>
              <p className="text-zinc-200 text-sm">{match.venue}</p>
            </div>
          )}
          {match.position && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">ポジション</p>
              <p className="text-zinc-200 text-sm">{match.position}</p>
            </div>
          )}
          {match.playingTimeMinutes && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">出場時間</p>
              <p className="text-zinc-200 text-sm">{match.playingTimeMinutes}分</p>
            </div>
          )}
        </div>

        {/* パフォーマンス評価 */}
        {match.performance && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-2">{t('matches.performance')}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  size={24}
                  className={
                    val <= match.performance!
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-700'
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* ハイライト */}
        {match.highlight && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-2">{t('matches.highlight')}</p>
            <p className="text-zinc-200 whitespace-pre-wrap">{match.highlight}</p>
          </div>
        )}

        {/* 改善点 */}
        {match.improvements && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-2">{t('matches.improvements')}</p>
            <p className="text-zinc-200 whitespace-pre-wrap">{match.improvements}</p>
          </div>
        )}
      </motion.div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-zinc-50 mb-2">試合記録を削除しますか？</h3>
            <p className="text-zinc-400 text-sm mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                キャンセル
              </button>
              <button
                onClick={async () => {
                  if (userProfile) {
                    await deleteMatch.mutateAsync({ matchId: match.id, userId: userProfile.uid });
                    navigate('/matches');
                  }
                }}
                disabled={deleteMatch.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors"
              >
                削除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
