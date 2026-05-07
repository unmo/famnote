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
    getApps: vitest_1.vi.fn(() => [{}]), // 初期化済みとしてモック
}));
// firebase-admin/firestoreをモック
const mockGet = vitest_1.vi.fn();
const mockDoc = vitest_1.vi.fn(() => ({ get: mockGet }));
const mockCollection = vitest_1.vi.fn(() => ({ doc: mockDoc }));
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vitest_1.vi.fn(() => ({
        collection: mockCollection,
    })),
}));
// firebase-admin/authをモック
vitest_1.vi.mock('firebase-admin/auth', () => ({
    getAuth: vitest_1.vi.fn(() => ({
        getUser: vitest_1.vi.fn().mockResolvedValue({ email: 'test@example.com' }),
    })),
}));
// firebase-functions/v2/httpsをモック
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    onCall: vitest_1.vi.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    },
}));
// stripeをモック
const mockSessionCreate = vitest_1.vi.fn();
vitest_1.vi.mock('stripe', () => {
    return {
        default: vitest_1.vi.fn().mockImplementation(() => ({
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
(0, vitest_1.describe)('createCheckoutSession', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({ email: 'test@example.com' }),
        });
    });
    (0, vitest_1.it)('未認証リクエストはunauthenticatedエラーを返す', async () => {
        // createCheckoutSessionはonCallのhandlerとしてexport
        const { createCheckoutSession } = await Promise.resolve().then(() => __importStar(require('./createCheckoutSession')));
        const handler = createCheckoutSession;
        await (0, vitest_1.expect)(handler({ auth: null, data: {} })).rejects.toThrow('認証が必要です');
    });
    (0, vitest_1.it)('認証済みリクエストはStripe checkout.sessions.createを呼び出しURLを返す', async () => {
        mockSessionCreate.mockResolvedValue({
            url: 'https://checkout.stripe.com/pay/cs_test_123',
        });
        const { createCheckoutSession } = await Promise.resolve().then(() => __importStar(require('./createCheckoutSession')));
        const handler = createCheckoutSession;
        const result = await handler({ auth: { uid: 'user123' }, data: {} });
        (0, vitest_1.expect)(mockSessionCreate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            mode: 'payment',
            payment_method_types: ['card'],
            metadata: { userId: 'user123' },
            success_url: vitest_1.expect.stringContaining('/purchase/success'),
            cancel_url: vitest_1.expect.stringContaining('/purchase/cancel'),
        }));
        (0, vitest_1.expect)(result.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
    });
});
//# sourceMappingURL=createCheckoutSession.test.js.map