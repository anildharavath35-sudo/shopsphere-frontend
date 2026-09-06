import { useCallback } from 'react';

let scriptPromise = null;

const loadScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Failed to load the payment gateway. Please try again.'));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

/**
 * Opens the Razorpay checkout. Options are built from the backend's
 * create-order response and a set of callbacks.
 */
export const useRazorpay = () => {
  const openCheckout = useCallback(
    ({
      key,        // RAZORPAY_KEY_ID from the server
      orderId,    // razorpay order id
      amount,     // in paise
      name = 'ShopSphere',
      description = 'Shopping order',
      email,
      phone,
      onSuccess,
      onFailure,
    }) => {
      (async () => {
        try {
          await loadScript();
          const rzp = new window.Razorpay({
            key,
            amount,
            currency: 'INR',
            name,
            description,
            order_id: orderId,
            prefill: { email, contact: phone || undefined },
            theme: { color: '#4f46e5' },
            handler(response) {
              onSuccess(response);
            },
            modal: {
              ondismiss() {
                onFailure && onFailure('Payment window closed');
              },
            },
          });
          rzp.on('payment.failed', (e) => {
            onFailure && onFailure(e.error?.description || 'Payment failed. Please try again.');
          });
          rzp.open();
        } catch (err) {
          onFailure && onFailure(err.message);
        }
      })();
    },
    []
  );

  return { openCheckout };
};