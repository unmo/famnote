import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, BookOpen, NotebookPen, Star, Palette, Lock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useStreak } from '@/hooks/useStreak';
import { useGroupNotes } from '@/hooks/useNotes';
import { useGroupJournals } from '@/hooks/useMatchJournals';
import { calculateStreak } from '@/lib/utils/streak';
import { formatRelativeTime } from '@/lib/utils/date';
import { db } from '@/lib/firebase/config';
import type { Timestamp } from 'firebase/firestore';
import type { Note } from '@/types/note';

const BADGE_DEFS = [
  // 行1: 連続記録
  { id: 'first_record', emoji: '👟' },
  { id: 'streak_3',     emoji: '🔥' },
  { id: 'streak_7',     emoji: '⚔️' },
  { id: 'streak_30',    emoji: '🏆' },
  // 行2: 練習ノート
  { id: 'notes_1',      emoji: '📝' },
  { id: 'notes_10',     emoji: '📓' },
  { id: 'notes_50',     emoji: '📚' },
  { id: 'notes_100',    emoji: '🗒️' },
  // 行3: 試合ノート
  { id: 'journals_1',   emoji: '⚽' },
  { id: 'journals_10',  emoji: '🏅' },
  { id: 'journals_50',  emoji: '🏟️' },
  { id: 'journals_100', emoji: '🥇' },
] as const;

function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['profileStats', userId],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      if (!userId) return { totalNotes: 0, totalJournals: 0, recordDates: [] as Date[] };
      const [notesSnap, journalsSnap] = await Promise.all([
        getDocs(query(collection(db, 'notes'), where('userId', '==', userId), where('isDraft', '==', false), limit(200))),
        getDocs(query(collection(db, 'matchJournals'), where('userId', '==', userId), limit(200))),
      ]);
      const recordDates = notesSnap.docs
        .map((d) => (d.data() as Note).createdAt?.toDate() ?? new Date(0))
        .filter((d) => d.getTime() > 0);
      return { totalNotes: notesSnap.size, totalJournals: journalsSnap.size, recordDates };
    },
  });
}

function BadgeItem({ badge, earned, label }: {
  badge: { id: string; emoji: string };
  earned: boolean;
  label: string | undefined;
}) {
  const { t } = useTranslation();
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative">
      <motion.div
        whileHover={earned ? { scale: 1.05 } : { scale: 1.03 }}
        onHoverStart={() => !earned && setShowTip(true)}
        onHoverEnd={() => setShowTip(false)}
        onTap={() => !earned && setShowTip((v) => !v)}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-default ${
          earned ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-800/50'
        }`}
      >
        <span className={`text-2xl ${!earned ? 'grayscale opacity-25' : ''}`}>{badge.emoji}</span>
        <p className={`text-[9px] font-semibold text-center leading-tight ${earned ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {earned ? label : <Lock size={8} className="mx-auto" />}
        </p>
      </motion.div>
      {!earned && showTip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-max max-w-[120px] bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 text-center leading-snug shadow-lg pointer-events-none"
        >
          {t(`badges.cond_${badge.id}`)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-800" />
        </motion.div>
      )}
    </div>
  );
}

const flameVariants = {
  animate: {
    rotate: [-3, 3, -3],
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const },
  },
};

const MENU_ITEMS = [
  {
    to: '/journals',
    icon: NotebookPen,
    label: '試合ノート',
    sub: '記録・振り返り',
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
  },
  {
    to: '/notes',
    icon: BookOpen,
    label: '練習ノート',
    sub: '練習内容を記録',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    to: '/highlights',
    icon: Star,
    label: '気づきのかけら',
    sub: '蓄積した気づき',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    to: '/theme',
    icon: Palette,
    label: 'テーマ',
    sub: 'チームカラーを変える',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
] as const;

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// 統合アクティビティアイテム型
type ActivityItem =
  | { kind: 'note'; id: string; userId: string; text: string; sortAt: Timestamp }
  | { kind: 'journal'; id: string; userId: string; opponent: string; sortAt: Timestamp };

export function DashboardPage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const members = useGroupStore((s) => s.members);
  const { data: streakData } = useStreak(userProfile?.uid);
  const { data: stats } = useProfileStats(userProfile?.uid);
  const { data: recentNotes, isLoading: notesLoading } = useGroupNotes(userProfile?.groupId ?? undefined);
  const { data: recentJournals, isLoading: journalsLoading } = useGroupJournals(userProfile?.groupId ?? undefined);

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = stats?.recordDates ? calculateStreak(stats.recordDates) : 0;
  const totalNotes    = stats?.totalNotes ?? 0;
  const totalJournals = stats?.totalJournals ?? 0;
  const weeklyStatus = streakData?.weeklyStatus ?? Array(7).fill(false);
  const isLoading = notesLoading || journalsLoading;

  const earnedBadgeIds = new Set<string>();
  if (totalNotes > 0 || totalJournals > 0) earnedBadgeIds.add('first_record');
  if (currentStreak >= 3)     earnedBadgeIds.add('streak_3');
  if (currentStreak >= 7)     earnedBadgeIds.add('streak_7');
  if (longestStreak >= 30)    earnedBadgeIds.add('streak_30');
  if (totalNotes >= 1)        earnedBadgeIds.add('notes_1');
  if (totalNotes >= 10)       earnedBadgeIds.add('notes_10');
  if (totalNotes >= 50)       earnedBadgeIds.add('notes_50');
  if (totalNotes >= 100)      earnedBadgeIds.add('notes_100');
  if (totalJournals >= 1)     earnedBadgeIds.add('journals_1');
  if (totalJournals >= 10)    earnedBadgeIds.add('journals_10');
  if (totalJournals >= 50)    earnedBadgeIds.add('journals_50');
  if (totalJournals >= 100)   earnedBadgeIds.add('journals_100');

  // 練習ノートと試合ノートを統合して日時降順に並べる
  const activities: ActivityItem[] = [
    ...(recentNotes ?? []).map((n) => ({
      kind: 'note' as const,
      id: n.id,
      userId: n.userId,
      text: n.content,
      sortAt: n.createdAt,
    })),
    ...(recentJournals ?? []).map((j) => ({
      kind: 'journal' as const,
      id: j.id,
      userId: j.userId,
      opponent: j.opponent,
      sortAt: j.date,
    })),
  ].sort((a, b) => b.sortAt.toMillis() - a.sortAt.toMillis()).slice(0, 5);

  // userId から displayName を引く
  const getName = (uid: string) =>
    members.find((m) => m.uid === uid)?.displayName ?? uid.slice(0, 6);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ウェルカムメッセージ */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">
          {t('dashboard.greeting', { name: userProfile?.displayName ?? t('common.defaultName') })}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* ストリークカード */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-orange-950/50 to-amber-950/50 border border-orange-900/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <motion.span
                variants={flameVariants}
                animate="animate"
                className="text-4xl select-none"
                aria-hidden="true"
              >
                🔥
              </motion.span>
              <span className="text-5xl font-extrabold text-zinc-50">{currentStreak}</span>
              <span className="text-zinc-400 text-lg">日</span>
            </div>
            <p className="text-orange-300 font-medium mt-1">{t('dashboard.streak')}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-zinc-500 text-xs text-right mb-1">{t('dashboard.thisWeek')}</p>
            <div className="flex gap-1.5">
              {weeklyStatus.map((active: boolean, i: number) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full transition-all ${
                    active ? 'bg-[var(--color-brand-primary)]' : 'bg-zinc-800'
                  }`}
                  aria-label={active ? '記録あり' : '記録なし'}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* バッジ */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">{t('profile.badges')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {BADGE_DEFS.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <BadgeItem key={badge.id} badge={badge} earned={earned} label={earned ? t(`badges.${badge.id}`) : undefined} />
            );
          })}
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-50">{t('dashboard.recentActivity')}</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                to={item.kind === 'journal' ? `/journals/${item.id}` : `/notes/${item.id}`}
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-700 transition-colors"
                >
                  {/* ノート種別アイコン */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.kind === 'journal'
                      ? 'bg-orange-500/15'
                      : 'bg-blue-500/15'
                  }`}>
                    {item.kind === 'journal'
                      ? <NotebookPen size={16} className="text-orange-400" />
                      : <BookOpen size={16} className="text-blue-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {/* 種別ラベル */}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.kind === 'journal'
                          ? 'bg-orange-500/15 text-orange-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {item.kind === 'journal' ? '試合ノート' : '練習ノート'}
                      </span>
                      <span className="text-zinc-600 text-xs">{getName(item.userId)}</span>
                      <span className="text-zinc-600 text-xs ml-auto">{formatRelativeTime(item.sortAt)}</span>
                    </div>
                    <p className="text-zinc-300 text-sm truncate">
                      {item.kind === 'journal' ? `vs ${item.opponent}` : item.text}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-zinc-400">{t('common.noRecords')}</p>
            <Link
              to="/journals/new"
              className="inline-flex items-center gap-2 mt-4 text-[var(--color-brand-primary)] text-sm hover:underline"
            >
              <Plus size={16} />
              {t('common.createFirstRecord')}
            </Link>
          </div>
        )}
      </div>

      {/* セクションナビゲーション */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">メニュー</h2>
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3"
        >
          {MENU_ITEMS.map(({ to, icon: Icon, label, sub, color, iconColor, borderColor }) => (
            <motion.div key={to} variants={itemVariants}>
              <Link to={to}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-br ${color} border ${borderColor} rounded-2xl p-4 transition-all duration-150`}
                >
                  <Icon size={24} className={`${iconColor} mb-3`} />
                  <p className="text-zinc-100 font-semibold text-sm">{label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
