import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './context/LanguageContext';
import { CookieProvider } from './context/CookieContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import { AuthProvider } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';
import { CommerceProvider } from './context/CommerceContext';
import App from './App';
import './styles/global.css';
import './styles/premium.css';
import './styles/account-sync.css';
import { registerPwa } from './utils/registerPwa';
import { retryPendingFormspree } from './services/formspree';
registerPwa();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LanguageProvider>
          <CookieProvider>
            <AuthProvider>
              <CommerceProvider>
                <CompareProvider>
                  <CartProvider>
                    <UserDataProvider>
                      <App />
                    </UserDataProvider>
                  </CartProvider>
                </CompareProvider>
              </CommerceProvider>
            </AuthProvider>
          </CookieProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);

if (typeof window !== 'undefined') {
  retryPendingFormspree().catch(() => {});
  window.addEventListener('online', () => retryPendingFormspree().catch(() => {}));
}
