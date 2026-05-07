"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const stripe_1 = __importDefault(require("stripe"));
// Admin SDKの初期化（多重初期化防止）
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
// 環境変数からStripeシークレットキーを取得（Secret Manager経由）
function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new https_1.HttpsError('internal', 'Stripe設定が不正です');
    }
    return new stripe_1.default(secretKey, { apiVersion: '2024-06-20' });
}
/**
 * Stripe Checkout Sessionを作成するCallable Function。
 * uidはFirebase Authの認証情報から取得し、クライアントからの改ざんを防ぐ。
 */
exports.createCheckoutSession = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d;
    // 認証チェック（未認証は即座に拒否）
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', '認証が必要です');
    }
    const uid = request.auth.uid;
    // ユーザーのメールアドレスをプリフィル用に取得
    let userEmail;
    try {
        const db = (0, firestore_1.getFirestore)();
        const userSnap = await db.collection('users').doc(uid).get();
        if (userSnap.exists) {
            userEmail = (_b = (_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : undefined;
        }
        else {
            // Firestoreにない場合はAuth経由で取得
            const authUser = await (0, auth_1.getAuth)().getUser(uid);
            userEmail = (_c = authUser.email) !== null && _c !== void 0 ? _c : undefined;
        }
    }
    catch (_e) {
        // メール取得失敗は無視してCheckout続行
        userEmail = undefined;
    }
    const priceId = process.env.STRIPE_PRICE_ID;
    const frontendUrl = (_d = process.env.FRONTEND_URL) !== null && _d !== void 0 ? _d : 'http://localhost:5173';
    if (!priceId) {
        throw new https_1.HttpsError('internal', 'Price IDが設定されていません');
    }
    let stripe;
    try {
        stripe = getStripe();
    }
    catch (err) {
        throw new https_1.HttpsError('internal', 'Stripe初期化に失敗しました');
    }
    try {
        const session = await stripe.checkout.sessions.create(Object.assign({ mode: 'payment', payment_method_types: ['card'], line_items: [{ price: priceId, quantity: 1 }], success_url: `${frontendUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${frontendUrl}/purchase/cancel`, metadata: { userId: uid } }, (userEmail ? { customer_email: userEmail } : {})));
        if (!session.url) {
            throw new https_1.HttpsError('internal', 'Checkout URLの取得に失敗しました');
        }
        return { url: session.url };
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
        // StripeAPIエラー
        throw new https_1.HttpsError('internal', '決済セッションの作成に失敗しました');
    }
});
//# sourceMappingURL=createCheckoutSession.js.map