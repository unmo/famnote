import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// firebase-admin/appをモック
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [{}]),
}));

// Firestoreトランザクションのモック
const mockTxGet = vi.fn();
const mockTxUpdate = vi.fn();
const mockTxSet = vi.fn();
const mockRunTransaction = vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
  await fn({ get: mockTxGet, update: mockTxUpdate, set: mockTxSet });
});

// purchasesコレクションのモック
const mockPurchasesWhere = vi.fn();
const mockPurchasesLimit = vi.fn();
const mockPurchasesGet = vi.fn();
mockPurchasesWhere.mockReturnValue({ limit: mockPurchasesLimit });
mockPurchasesLimit.mockReturnValue({ get: mockPurchasesGet });

// Firestoreのモック
const mockUsersDoc = vi.fn(() => 'userRef');
const mockPurchasesDoc = vi.fn(() => 'purchaseRef');
const mockCollection = vi.fn((name: string) => {
  if (name === 'users') return { doc: mockUsersDoc };
  if (name === 'purchases') return {
    doc: mockPurchasesDoc,
    where: mockPurchasesWhere,
  };
  return {};
});

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  })),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'serverTimestamp'),
  },
}));

// firebase-functions/v2/httpsをモック
vi.mock('firebase-functions/v2/https', () => ({
  onRequest: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

// Stripeのモック
const mockConstructEvent = vi.fn();
const mockSessionsList = vi.fn();
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
      checkout: {
        sessions: {
          list: mockSessionsList,
        },
      },
    })),
  };
});

// 環境変数
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';

/** レスポンスのモック */
function createMockRes() {
  const res = {
    statusCode: 0,
    body: '',
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.send.mockImplementation((body: string) => {
    res.body = body;
    return res;
  });
  return res;
}

describe('stripeWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトでは空の購入履歴（冪等性チェックで新規扱い）
    mockPurchasesGet.mockResolvedValue({ empty: true });
    // デフォルトのtransaction.get
    mockTxGet.mockResolvedValue({
      exists: true,
      data: () => ({ purchasedCount: 0 }),
    });
  });

  it('stripe-signatureヘッダーがない場合は400を返す', async () => {
    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = { headers: {}, rawBody: Buffer.from('{}') };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    expect(res.statusCode).toBe(400);
  });

  it('署名検証に失敗した場合は400を返す', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('署名が不正です');
    });

    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = {
      headers: { 'stripe-signature': 'invalid_sig' },
      rawBody: Buffer.from('{}'),
    };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    expect(res.statusCode).toBe(400);
  });

  it('payment_intent.succeeded以外のイベントは200/ignoredを返す', async () => {
    mockConstructEvent.mockReturnValue({ type: 'charge.succeeded', data: { object: {} } });

    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = {
      headers: { 'stripe-signature': 'valid_sig' },
      rawBody: Buffer.from('{}'),
    };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    expect(res.statusCode).toBe(200);
  });

  it('正常イベントでFirestoreのpurchasedCountが+1される', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount_received: 480,
          currency: 'jpy',
        },
      },
    });

    mockSessionsList.mockResolvedValue({
      data: [{
        id: 'cs_test_123',
        metadata: { userId: 'user_abc' },
      }],
    });

    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = {
      headers: { 'stripe-signature': 'valid_sig' },
      rawBody: Buffer.from('{}'),
    };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxUpdate).toHaveBeenCalledWith(
      'userRef',
      { purchasedCount: 1, plan: 'paid' }
    );
    expect(res.statusCode).toBe(200);
  });

  it('正常イベントでpurchasesコレクションに履歴が作成される', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_456',
          amount_received: 480,
          currency: 'jpy',
        },
      },
    });

    mockSessionsList.mockResolvedValue({
      data: [{
        id: 'cs_test_456',
        metadata: { userId: 'user_xyz' },
      }],
    });

    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = {
      headers: { 'stripe-signature': 'valid_sig' },
      rawBody: Buffer.from('{}'),
    };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    expect(mockTxSet).toHaveBeenCalledWith(
      'purchaseRef',
      expect.objectContaining({
        userId: 'user_xyz',
        stripeSessionId: 'cs_test_456',
        stripePaymentIntentId: 'pi_test_456',
        packCount: 1,
        noteCountAdded: 100,
        status: 'succeeded',
      })
    );
  });

  it('冪等性: 同一stripeSessionIdの場合はFirestoreを更新しない', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_dup_123',
          amount_received: 480,
          currency: 'jpy',
        },
      },
    });

    mockSessionsList.mockResolvedValue({
      data: [{
        id: 'cs_dup_123',
        metadata: { userId: 'user_dup' },
      }],
    });

    // 既に処理済みの場合（冪等性チェックで重複検出）
    mockPurchasesGet.mockResolvedValue({ empty: false });

    const { stripeWebhook } = await import('./stripeWebhook');
    const handler = stripeWebhook as unknown as (req: Partial<Request>, res: Response) => Promise<void>;

    const req = {
      headers: { 'stripe-signature': 'valid_sig' },
      rawBody: Buffer.from('{}'),
    };
    const res = createMockRes();

    await handler(req as Partial<Request>, res as unknown as Response);

    // トランザクションは実行されない
    expect(mockRunTransaction).not.toHaveBeenCalled();
    // 200で返す（Stripeのリトライを止める）
    expect(res.statusCode).toBe(200);
  });
});
