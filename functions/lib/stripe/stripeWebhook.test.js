"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// firebase-admin/appをモック
vitest_1.vi.mock('firebase-admin/app', () => ({
    initializeApp: vitest_1.vi.fn(),
    getApps: vitest_1.vi.fn(() => [{}]),
}));
// Firestoreトランザクションのモック
const mockTxGet = vitest_1.vi.fn();
const mockTxUpdate = vitest_1.vi.fn();
const mockTxSet = vitest_1.vi.fn();
const mockRunTransaction = vitest_1.vi.fn(async (fn) => {
    await fn({ get: mockTxGet, update: mockTxUpdate, set: mockTxSet });
});
// purchasesコレクションのモック
const mockPurchasesWhere = vitest_1.vi.fn();
const mockPurchasesLimit = vitest_1.vi.fn();
const mockPurchasesGet = vitest_1.vi.fn();
mockPurchasesWhere.mockReturnValue({ limit: mockPurchasesLimit });
mockPurchasesLimit.mockReturnValue({ get: mockPurchasesGet });
// Firestoreのモック
const mockUsersDoc = vitest_1.vi.fn(() => 'userRef');
const mockPurchasesDoc = vitest_1.vi.fn(() => 'purchaseRef');
const mockCollection = vitest_1.vi.fn((name) => {
    if (name === 'users')
        return { doc: mockUsersDoc };
    if (name === 'purchases')
        return {
            doc: mockPurchasesDoc,
            where: mockPurchasesWhere,
        };
    return {};
});
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vitest_1.vi.fn(() => ({
        collection: mockCollection,
        runTransaction: mockRunTransaction,
    })),
    FieldValue: {
        serverTimestamp: vitest_1.vi.fn(() => 'serverTimestamp'),
    },
}));
// firebase-functions/v2/httpsをモック
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    onRequest: vitest_1.vi.fn((_opts, handler) => handler),
}));
// Stripeのモック
const mockConstructEvent = vitest_1.vi.fn();
const mockSessionsList = vitest_1.vi.fn();
vitest_1.vi.mock('stripe', () => {
    return {
        default: vitest_1.vi.fn().mockImplementation(() => ({
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
        status: vitest_1.vi.fn().mockReturnThis(),
        send: vitest_1.vi.fn().mockReturnThis(),
    };
    res.status.mockImplementation((code) => {
        res.statusCode = code;
        return res;
    });
    res.send.mockImplementation((body) => {
        res.body = body;
        return res;
    });
    return res;
}
(0, vitest_1.describe)('stripeWebhook', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        // デフォルトでは空の購入履歴（冪等性チェックで新規扱い）
        mockPurchasesGet.mockResolvedValue({ empty: true });
        // デフォルトのtransaction.get
        mockTxGet.mockResolvedValue({
            exists: true,
            data: () => ({ purchasedCount: 0 }),
        });
    });
    (0, vitest_1.it)('stripe-signatureヘッダーがない場合は400を返す', async () => {
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = { headers: {}, rawBody: Buffer.from('{}') };
        const res = createMockRes();
        await handler(req, res);
        (0, vitest_1.expect)(res.statusCode).toBe(400);
    });
    (0, vitest_1.it)('署名検証に失敗した場合は400を返す', async () => {
        mockConstructEvent.mockImplementation(() => {
            throw new Error('署名が不正です');
        });
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = {
            headers: { 'stripe-signature': 'invalid_sig' },
            rawBody: Buffer.from('{}'),
        };
        const res = createMockRes();
        await handler(req, res);
        (0, vitest_1.expect)(res.statusCode).toBe(400);
    });
    (0, vitest_1.it)('payment_intent.succeeded以外のイベントは200/ignoredを返す', async () => {
        mockConstructEvent.mockReturnValue({ type: 'charge.succeeded', data: { object: {} } });
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = {
            headers: { 'stripe-signature': 'valid_sig' },
            rawBody: Buffer.from('{}'),
        };
        const res = createMockRes();
        await handler(req, res);
        (0, vitest_1.expect)(res.statusCode).toBe(200);
    });
    (0, vitest_1.it)('正常イベントでFirestoreのpurchasedCountが+1される', async () => {
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
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = {
            headers: { 'stripe-signature': 'valid_sig' },
            rawBody: Buffer.from('{}'),
        };
        const res = createMockRes();
        await handler(req, res);
        (0, vitest_1.expect)(mockRunTransaction).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockTxUpdate).toHaveBeenCalledWith('userRef', { purchasedCount: 1, plan: 'paid' });
        (0, vitest_1.expect)(res.statusCode).toBe(200);
    });
    (0, vitest_1.it)('正常イベントでpurchasesコレクションに履歴が作成される', async () => {
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
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = {
            headers: { 'stripe-signature': 'valid_sig' },
            rawBody: Buffer.from('{}'),
        };
        const res = createMockRes();
        await handler(req, res);
        (0, vitest_1.expect)(mockTxSet).toHaveBeenCalledWith('purchaseRef', vitest_1.expect.objectContaining({
            userId: 'user_xyz',
            stripeSessionId: 'cs_test_456',
            stripePaymentIntentId: 'pi_test_456',
            packCount: 1,
            noteCountAdded: 100,
            status: 'succeeded',
        }));
    });
    (0, vitest_1.it)('冪等性: 同一stripeSessionIdの場合はFirestoreを更新しない', async () => {
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
        const { stripeWebhook } = await Promise.resolve().then(() => __importStar(require('./stripeWebhook')));
        const handler = stripeWebhook;
        const req = {
            headers: { 'stripe-signature': 'valid_sig' },
            rawBody: Buffer.from('{}'),
        };
        const res = createMockRes();
        await handler(req, res);
        // トランザクションは実行されない
        (0, vitest_1.expect)(mockRunTransaction).not.toHaveBeenCalled();
        // 200で返す（Stripeのリトライを止める）
        (0, vitest_1.expect)(res.statusCode).toBe(200);
    });
});
//# sourceMappingURL=stripeWebhook.test.js.map