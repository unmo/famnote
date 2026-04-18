import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/theme/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/index';
import '@/i18n/index';
import './index.css';

// アプリのルートレンダリング
const root = document.getElementById('root');
if (!root) throw new Error('ルート要素が見つかりません');

createRoot(root).render(
  <StrictMode>
    {/* テーマプロバイダー（CSS変数管理） */}
    <ThemeProvider>
      {/* TanStack Query プロバイダー */}
      <QueryClientProvider client={queryClient}>
        {/* Firebase認証プロバイダー */}
        <AuthProvider>
          {/* React Router プロバイダー */}
          <RouterProvider router={router} />
          {/* Sonner トースト通知 */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #3f3f46',
                color: '#f4f4f5',
              },
            }}
            richColors
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
