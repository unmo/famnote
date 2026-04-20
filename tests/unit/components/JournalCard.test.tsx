import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchJournalCard } from '@/components/journals/MatchJournalCard';
import type { MatchJournal } from '@/types/matchJournal';
import { Timestamp } from 'firebase/firestore';

// Firestoreのモック
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    Timestamp: {
      fromDate: (d: Date) => ({ toDate: () => d, seconds: d.getTime() / 1000, nanoseconds: 0 }),
      now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
    },
  };
});

function makeJournal(overrides: Partial<MatchJournal> = {}): MatchJournal {
  const now = { toDate: () => new Date('2026-04-18'), seconds: 1, nanoseconds: 0 } as unknown as Timestamp;
  return {
    id: 'test-id',
    userId: 'user1',
    groupId: 'group1',
    sport: 'soccer',
    date: now,
    opponent: 'テストFC',
    venue: null,
    status: 'pre',
    isDraft: false,
    isPublic: true,
    preNote: {
      goals: [{ id: 'g1', text: '目標1', isPinned: false }],
      challenges: [],
      recordedAt: now,
    },
    postNote: null,
    reactionCounts: { applause: 0, fire: 0, star: 0, muscle: 0 },
    commentCount: 0,
    pinnedCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('MatchJournalCard', () => {
  it('正常系: status=preのカードに「振り返りを書く」ボタンが表示される', () => {
    render(
      <MatchJournalCard
        journal={makeJournal({ status: 'pre' })}
        onPress={vi.fn()}
        onPostNotePress={vi.fn()}
      />
    );
    expect(screen.getByText(/試合後の振り返りを書く/)).toBeTruthy();
  });

  it('正常系: status=completedのカードに振り返り完了バッジが表示される', () => {
    const now = { toDate: () => new Date('2026-04-18'), seconds: 1, nanoseconds: 0 } as unknown as Timestamp;
    render(
      <MatchJournalCard
        journal={makeJournal({
          status: 'completed',
          postNote: {
            result: 'win',
            myScore: 3,
            opponentScore: 1,
            goalReviews: [],
            achievements: [],
            improvements: [],
            explorations: [],
            performance: null,
            imageUrls: [],
            recordedAt: now,
          },
        })}
        onPress={vi.fn()}
      />
    );
    expect(screen.getByText('振り返り完了')).toBeTruthy();
  });

  it('正常系: status=post_onlyのカードに「試合後のみ」バッジが表示される', () => {
    render(
      <MatchJournalCard
        journal={makeJournal({ status: 'post_only', preNote: null })}
        onPress={vi.fn()}
      />
    );
    expect(screen.getByText('試合後のみ')).toBeTruthy();
  });

  it('正常系: 対戦相手名が表示される', () => {
    render(
      <MatchJournalCard
        journal={makeJournal({ opponent: 'テストFC' })}
        onPress={vi.fn()}
      />
    );
    expect(screen.getByText('vs テストFC')).toBeTruthy();
  });
});
