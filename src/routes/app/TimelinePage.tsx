import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useGroupNotes } from '@/hooks/useNotes';
import { SportBadge } from '@/components/shared/SportBadge';
import { Avatar } from '@/components/shared/Avatar';
import { formatRelativeTime } from '@/lib/utils/date';
import { Globe, Lock, BookOpen } from 'lucide-react';
import { REACTION_EMOJIS, REACTION_TYPES } from '@/types/reaction';
import { toggleReaction, getUserReactions } from '@/lib/firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ReactionType } from '@/types/reaction';
import type { Note } from '@/types/note';

// リアクションバーコンポーネント
function ReactionBar({ note }: { note: Note }) {
  const { userProfile } = useAuthStore();
  const qc = useQueryClient();

  const { data: userReactions = [] } = useQuery({
    queryKey: ['reactions', note.id, userProfile?.uid],
    enabled: !!userProfile?.uid,
    queryFn: () => getUserReactions(note.id, userProfile!.uid),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ reactionType }: { reactionType: ReactionType }) =>
      toggleReaction('note', note.id, userProfile!.uid, userProfile!.groupId!, reactionType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reactions', note.id] });
      qc.invalidateQueries({ queryKey: ['groupNotes'] });
    },
    onError: () => toast.error('リアクションに失敗しました'),
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {REACTION_TYPES.map((type) => {
        const count = note.reactionCounts?.[type] ?? 0;
        const isActive = userReactions.includes(type);
        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => toggleMutation.mutate({ reactionType: type })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${
              isActive
                ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
            aria-label={`${REACTION_EMOJIS[type]}リアクション（${count}件）`}
          >
            <span>{REACTION_EMOJIS[type]}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

// タイムラインアイテムコンポーネント
function TimelineItem({ note }: { note: Note }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.content.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Avatar size="sm" name={note.userId} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <SportBadge sport={note.sport} size="sm" />
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              {note.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {formatRelativeTime(note.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div>
        <p className={`text-zinc-300 text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
          {note.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[var(--color-brand-primary)] text-sm mt-1 hover:underline"
          >
            {expanded ? '閉じる' : '続きを読む'}
          </button>
        )}
      </div>

      {/* リアクション */}
      <ReactionBar note={note} />

      {/* 詳細リンク */}
      <Link
        to={`/notes/${note.id}`}
        className="flex items-center gap-1 text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
      >
        <BookOpen size={12} />
        詳細を見る
      </Link>
    </motion.div>
  );
}

import { useState } from 'react';

// 家族タイムラインページ
export function TimelinePage() {
  const { t } = useTranslation();
  const { userProfile } = useAuthStore();
  const { data: notes, isLoading } = useGroupNotes(userProfile?.groupId ?? undefined);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6">{t('timeline.title')}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <TimelineItem key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏃</p>
          <p className="text-zinc-400">{t('timeline.empty')}</p>
        </div>
      )}
    </div>
  );
}
