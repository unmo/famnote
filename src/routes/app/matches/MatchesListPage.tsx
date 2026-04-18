import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useMatches } from '@/hooks/useMatches';
import { SportBadge } from '@/components/shared/SportBadge';
import { formatDateJa } from '@/lib/utils/date';
import { clsx } from 'clsx';

const resultColors = {
  win: 'bg-green-900/50 border-green-800 text-green-400',
  draw: 'bg-amber-900/50 border-amber-800 text-amber-400',
  loss: 'bg-red-900/50 border-red-800 text-red-400',
};

const resultLabels = { win: '勝ち', draw: '引き分け', loss: '負け' };

// 試合記録一覧ページ
export function MatchesListPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: matches, isLoading } = useMatches(userProfile?.uid);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">{t('matches.title')}</h1>
        <Link to="/matches/new">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus size={16} />
            {t('matches.new')}
          </motion.div>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match) => (
            <Link key={match.id} to={`/matches/${match.id}`}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SportBadge sport={match.sport} size="sm" />
                    <span className="text-zinc-50 font-medium">vs {match.opponent}</span>
                  </div>
                  <span className="text-zinc-500 text-xs shrink-0">
                    {formatDateJa(match.date)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* スコア */}
                  {(match.myScore !== null || match.opponentScore !== null) && (
                    <span className="text-zinc-300 font-mono">
                      {match.myScore ?? '-'} - {match.opponentScore ?? '-'}
                    </span>
                  )}

                  {/* 勝敗バッジ */}
                  {match.result && (
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium border',
                        resultColors[match.result]
                      )}
                    >
                      {resultLabels[match.result]}
                    </span>
                  )}

                  {/* 会場 */}
                  {match.venue && (
                    <span className="text-zinc-500 text-xs">📍 {match.venue}</span>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-zinc-400 mb-4">{t('matches.empty')}</p>
          <Link to="/matches/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            {t('matches.createFirst')}
          </Link>
        </div>
      )}
    </div>
  );
}
