import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LandingPage } from '@/routes/app/LandingPage';
import { LoginPage } from '@/routes/auth/LoginPage';
import { ProfileSetupPage } from '@/routes/onboarding/ProfileSetupPage';
import { CreateGroupPage } from '@/routes/onboarding/CreateGroupPage';
import { JoinGroupPage } from '@/routes/onboarding/JoinGroupPage';
import { DashboardPage } from '@/routes/app/DashboardPage';
import { NotesListPage } from '@/routes/app/notes/NotesListPage';
import { NoteNewPage } from '@/routes/app/notes/NoteNewPage';
import { NoteDetailPage } from '@/routes/app/notes/NoteDetailPage';
import { NoteEditPage } from '@/routes/app/notes/NoteEditPage';
import { MatchesListPage } from '@/routes/app/matches/MatchesListPage';
import { MatchNewPage } from '@/routes/app/matches/MatchNewPage';
import { MatchDetailPage } from '@/routes/app/matches/MatchDetailPage';
import { MatchEditPage } from '@/routes/app/matches/MatchEditPage';
import { TimelinePage } from '@/routes/app/TimelinePage';
import { GoalsListPage } from '@/routes/app/goals/GoalsListPage';
import { GoalNewPage } from '@/routes/app/goals/GoalNewPage';
import { MyProfilePage } from '@/routes/app/profile/MyProfilePage';
import { MemberProfilePage } from '@/routes/app/profile/MemberProfilePage';
import { SettingsPage } from '@/routes/app/SettingsPage';
import { JournalListPage } from '@/routes/app/journals/JournalListPage';
import { JournalPrePage } from '@/routes/app/journals/JournalPrePage';
import { JournalPostPage } from '@/routes/app/journals/JournalPostPage';
import { JournalDetailPage } from '@/routes/app/journals/JournalDetailPage';
import { HighlightsPage } from '@/routes/app/highlights/HighlightsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // /signup へのアクセスは /login にリダイレクト
    path: '/signup',
    element: <Navigate to="/login" replace />,
  },
  {
    // /auth/signup へのアクセスも /login にリダイレクト
    path: '/auth/signup',
    element: <Navigate to="/login" replace />,
  },
  {
    // オンボーディング: 認証済みだがグループ未参加ユーザー用
    path: '/onboarding',
    element: <ProtectedRoute requireGroup={false} />,
    children: [
      { path: 'profile', element: <ProfileSetupPage /> },
      { path: 'create-group', element: <CreateGroupPage /> },
      { path: 'join-group', element: <JoinGroupPage /> },
    ],
  },
  {
    // メインアプリ: 認証済み・グループ参加済みユーザー用
    element: <ProtectedRoute requireGroup={true} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/notes', element: <NotesListPage /> },
          { path: '/notes/new', element: <NoteNewPage /> },
          { path: '/notes/:id', element: <NoteDetailPage /> },
          { path: '/notes/:id/edit', element: <NoteEditPage /> },
          { path: '/matches', element: <MatchesListPage /> },
          { path: '/matches/new', element: <MatchNewPage /> },
          { path: '/matches/:id', element: <MatchDetailPage /> },
          { path: '/matches/:id/edit', element: <MatchEditPage /> },
          { path: '/timeline', element: <TimelinePage /> },
          { path: '/goals', element: <GoalsListPage /> },
          { path: '/goals/new', element: <GoalNewPage /> },
          { path: '/profile', element: <MyProfilePage /> },
          { path: '/profile/:userId', element: <MemberProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          // 試合ジャーナル
          { path: '/journals', element: <JournalListPage /> },
          { path: '/journals/new', element: <JournalPrePage /> },
          { path: '/journals/:id', element: <JournalDetailPage /> },
          { path: '/journals/:id/post', element: <JournalPostPage /> },
          // ハイライト
          { path: '/highlights', element: <HighlightsPage /> },
        ],
      },
    ],
  },
]);
