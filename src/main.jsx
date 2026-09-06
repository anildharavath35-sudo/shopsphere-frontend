import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

useUIStore.getState().initTheme();

(async () => {
  try {
    if (useAuthStore.getState().token) {
      await useAuthStore.getState().fetchMe();
      await useCartStore.getState().hydrate(true);
      await useWishlistStore.getState().hydrate();
    } else {
      await useCartStore.getState().hydrate(true);
      await useWishlistStore.getState().hydrate();
    }
  } catch {
    /* silent bootstrap failure - pages handle their own errors */
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);