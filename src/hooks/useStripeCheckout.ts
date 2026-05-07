import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { app } from '@/lib/firebase/config';
import { toast } from 'sonner';

interface CreateCheckoutSessionResponse {
  url: string;
}

/**
 * Stripe Checkout Sessionを作成してリダイレクトするフック。
 * uidはCloud Function側でFirebase Authから取得するため、引数不要。
 */
export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const functions = getFunctions(app, 'asia-northeast1');
      const createCheckoutSession = httpsCallable<
        Record<string, never>,
        CreateCheckoutSessionResponse
      >(functions, 'createCheckoutSession');

      const result = await createCheckoutSession({});

      if (result.data.url) {
        // Stripeのホスト型Checkoutページへリダイレクト
        window.location.href = result.data.url;
      } else {
        throw new Error('Checkout URLが返却されませんでした');
      }
    } catch (err) {
      console.error('Checkout Session作成エラー:', err);
      toast.error('決済ページの取得に失敗しました。しばらく経ってから再度お試しください。', {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading };
}
