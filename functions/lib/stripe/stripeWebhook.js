"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const stripe_1 = __importDefault(require("stripe"));
// Admin SDKの初期化（多重初期化防止）
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY が設定されていません');
    }
    return new stripe_1.default(secretKey, { apiVersion: '2024-06-20' });
}
/**
 * Stripe Webhookを処理するHTTPS Function。
 * rawBody: true を指定することで req.rawBody が利用可能になり、署名検証に使用する。
 * 署名検証は必ず最初に実行し、検証通過後のみビジネスロジックを実行する。
 */
exports.stripeWebhook = (0, https_1.onRequest)({}, async (req, res) => {
    var _a;
    // Stripe-Signatureヘッダーの存在チェック
    const sig = req.headers['stripe-signature'];
    if (!sig || (Array.isArray(sig) && sig.length === 0)) {
        res.status(400).send('stripe-signature ヘッダーがありません');
        return;
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET が設定されていません');
        res.status(500).send('サーバー設定エラー');
        return;
    }
    let event;
    let stripe;
    try {
        stripe = getStripe();
    }
    catch (err) {
        console.error('Stripe初期化失敗:', err);
        res.status(500).send('サーバー設定エラー');
        return;
    }
    // Webhook署名検証（必ず rawBody を使用）
    try {
        const rawBody = req.rawBody;
        const sigHeader = Array.isArray(sig) ? sig[0] : sig;
        event = stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
    }
    catch (err) {
        console.error('Webhook署名検証失敗:', err);
        res.status(400).send(`Webhook署名検証に失敗しました: ${err}`);
        return;
    }
    // 処理対象のイベントタイプを限定（payment_intent.succeededのみ処理）
    if (event.type !== 'payment_intent.succeeded') {
        res.status(200).send('対象外のイベントタイプのためスキップします');
        return;
    }
    const paymentIntent = event.data.object;
    // CheckoutSessionからuserIdをmetadata経由で取得
    let sessions;
    try {
        sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
        });
    }
    catch (err) {
        console.error('CheckoutSession取得失敗:', err);
        res.status(500).send('CheckoutSession取得に失敗しました');
        return;
    }
    const session = sessions.data[0];
    if (!session) {
        console.error('対応するCheckoutSessionが見つかりません:', paymentIntent.id);
        res.status(400).send('CheckoutSessionが見つかりません');
        return;
    }
    const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        console.error('session.metadata.userId が存在しません:', session.id);
        res.status(400).send('userIdがsession metadataに含まれていません');
        return;
    }
    const db = (0, firestore_1.getFirestore)();
    // 冪等性チェック: 同一stripeSessionIdで既処理かを確認
    const existingPurchase = await db
        .collection('purchases')
        .where('stripeSessionId', '==', session.id)
        .limit(1)
        .get();
    if (!existingPurchase.empty) {
        // 既に処理済み: 200を返してStripeのリトライを止める
        res.status(200).send('既に処理済みです');
        return;
    }
    // Firestoreをトランザクションで原子的に更新
    const userRef = db.collection('users').doc(userId);
    try {
        await db.runTransaction(async (tx) => {
            var _a, _b;
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists) {
                throw new Error(`ユーザードキュメントが見つかりません: ${userId}`);
            }
            const currentPurchasedCount = ((_b = (_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.purchasedCount) !== null && _b !== void 0 ? _b : 0);
            const newPurchasedCount = currentPurchasedCount + 1;
            // usersドキュメントを更新: purchasedCount += 1、plan = 'paid'
            tx.update(userRef, {
                purchasedCount: newPurchasedCount,
                plan: 'paid',
            });
            // 購入履歴（監査ログ）を作成
            const purchaseRef = db.collection('purchases').doc();
            tx.set(purchaseRef, {
                id: purchaseRef.id,
                userId,
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntent.id,
                amountTotal: paymentIntent.amount_received,
                currency: paymentIntent.currency,
                packCount: 1,
                noteCountAdded: 100,
                purchasedCountBefore: currentPurchasedCount,
                purchasedCountAfter: newPurchasedCount,
                status: 'succeeded',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
        });
        res.status(200).send('OK');
    }
    catch (err) {
        console.error('Firestoreトランザクション失敗:', err);
        res.status(500).send('Firestore更新に失敗しました');
    }
});
//# sourceMappingURL=stripeWebhook.js.map