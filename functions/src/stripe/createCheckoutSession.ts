import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';

// Admin SDKの初期化（多重初期化防止）
if (getApps().length === 0) {
  initializeApp();
}

// 環境変数からStripeシークレットキーを取得（Secret Manager経由）
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new HttpsError('internal', 'Stripe設定が不正です');
  }
  return new Stripe(secretKey, { apiVersion: '2024-06-20' });
}

// Checkout Sessionのレスポンス型
interface CreateCheckoutSessionResponse {
  url: string;
}

/**
 * Stripe Checkout Sessionを作成するCallable Function。
 * uidはFirebase Authの認証情報から取得し、クライアントからの改ざんを防ぐ。
 */
export const createCheckoutSession = onCall<
  Record<string, never>,
  Promise<CreateCheckoutSessionResponse>
>(async (request) => {
  // 認証チェック（未認証は即座に拒否）
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '認証が必要です');
  }

  const uid = request.auth.uid;

  // ユーザーのメールアドレスをプリフィル用に取得
  let userEmail: string | undefined;
  try {
    const db = getFirestore();
    const userSnap = await db.collection('users').doc(uid).get();
    if (userSnap.exists) {
      userEmail = (userSnap.data()?.email as string | undefined) ?? undefined;
    } else {
      // Firestoreにない場合はAuth経由で取得
      const authUser = await getAuth().getUser(uid);
      userEmail = authUser.email ?? undefined;
    }
  } catch {
    // メール取得失敗は無視してCheckout続行
    userEmail = undefined;
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  if (!priceId) {
    throw new HttpsError('internal', 'Price IDが設定されていません');
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    throw new HttpsError('internal', 'Stripe初期化に失敗しました');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/purchase/cancel`,
      metadata: { userId: uid },
      ...(userEmail ? { customer_email: userEmail } : {}),
    });

    if (!session.url) {
      throw new HttpsError('internal', 'Checkout URLの取得に失敗しました');
    }

    return { url: session.url };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    // StripeAPIエラー
    throw new HttpsError('internal', '決済セッションの作成に失敗しました');
  }
});
