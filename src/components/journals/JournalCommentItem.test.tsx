import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JournalCommentItem } from './JournalCommentItem';
import type { JournalComment } from '@/types/matchJournal';
import { Timestamp } from 'firebase/firestore';

const baseComment: JournalComment = {
  id: 'comment-1',
  journalId: 'journal-1',
  userId: 'user-1',
  displayName: '田中 太郎',
  avatarUrl: null,
  role: 'parent',
  text: 'テストコメント',
  parentCommentId: null,
  replyCount: 0,
  createdAt: Timestamp.fromDate(new Date()),
};

describe('JournalCommentItem', () => {
  it('正常系: parentRole が father のとき父バッジが表示される', () => {
    const comment = { ...baseComment, parentRole: 'father' as const };
    render(
      <JournalCommentItem
        comment={comment}
        currentUserId="other-user"
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('profile.parentRoleFather')).toBeInTheDocument();
  });

  it('正常系: parentRole が mother のとき母バッジが表示される', () => {
    const comment = { ...baseComment, parentRole: 'mother' as const };
    render(
      <JournalCommentItem
        comment={comment}
        currentUserId="other-user"
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('profile.parentRoleMother')).toBeInTheDocument();
  });

  it('正常系: parentRole が null のときバッジが表示されない', () => {
    const comment = { ...baseComment, parentRole: null };
    render(
      <JournalCommentItem
        comment={comment}
        currentUserId="other-user"
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('profile.parentRoleFather')).not.toBeInTheDocument();
    expect(screen.queryByText('profile.parentRoleMother')).not.toBeInTheDocument();
  });

  it('正常系: parentRole が undefined のときバッジが表示されない', () => {
    const comment = { ...baseComment };
    render(
      <JournalCommentItem
        comment={comment}
        currentUserId="other-user"
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('profile.parentRoleFather')).not.toBeInTheDocument();
    expect(screen.queryByText('profile.parentRoleMother')).not.toBeInTheDocument();
  });
});
