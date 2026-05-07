import { describe, it, expect, vi, beforeEach } from 'vitest';

// firebase-admin/appをモック
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [{}]), // 初期化済みとしてモック
}));

// firebase-admin/firestoreをモック
const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({ get: mockGet }));
const mockCollection = vi.fn(() => ({ doc: mockDoc }));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

// firebase-admin/authをモック
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    getUser: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
  })),
}));

// firebase-functions/v2/httpsをモック
vi.mock('firebase-functions/v2/https', () => ({
  onCall: vi.fn((handler) => handler),
  HttpsError: class HttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

// stripeをモック
const mockSessionCreate = vi.fn();
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockSessionCreate,
        },
      },
    })),
  };
});

// 環境変数を設定
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PRICE_ID = 'price_test_mock';
process.env.FRONTEND_URL = 'http://localhost:5173';

describe('createCheckoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ email: 'test@example.com' }),
    });
  });

  it('未認証リクエストはunauthenticatedエラーを返す', async () => {
    // createCheckoutSessionはonCallのhandlerとしてexport
    const { createCheckoutSession } = await import('./createCheckoutSession');

    const handler = createCheckoutSession as unknown as (
      request: { auth: null; data: Record<string, never> }
    ) => Promise<{ url: string }>;

    await expect(
      handler({ auth: null, data: {} })
    ).rejects.toThrow('認証が必要です');
  });

  it('認証済みリクエストはStripe checkout.sessions.createを呼び出しURLを返す', async () => {
    mockSessionCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const { createCheckoutSession } = await import('./createCheckoutSession');

    const handler = createCheckoutSession as unknown as (
      request: { auth: { uid: string }; data: Record<string, never> }
    ) => Promise<{ url: string }>;

    const result = await handler({ auth: { uid: 'user123' }, data: {} });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        payment_method_types: ['card'],
        metadata: { userId: 'user123' },
        success_url: expect.stringContaining('/purchase/success'),
        cancel_url: expect.stringContaining('/purchase/cancel'),
      })
    );
    expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
  });
});
