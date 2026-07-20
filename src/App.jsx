import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';
import CartDrawer from './components/layout/CartDrawer';
import ScrollToTop from './components/layout/ScrollToTop';
import LoadingScreen from './components/common/LoadingScreen';
import { usePageTracking } from './hooks/usePageTracking';
import RouteExperience from './components/experience/RouteExperience';
import PwaPrompt from './components/pwa/PwaPrompt';

const Home = lazy(() => import('./pages/HomePage'));
const About = lazy(() => import('./pages/AboutPage'));
const Shop = lazy(() => import('./pages/ShopPage'));
const Product = lazy(() => import('./pages/ProductPage'));
const Cart = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/CheckoutPage'));
const CheckoutStatus = lazy(() => import('./pages/CheckoutStatusPage'));
const Programs = lazy(() => import('./pages/ProgramsPage'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetailPage'));
const Events = lazy(() => import('./pages/EventsPage'));
const EventDetail = lazy(() => import('./pages/EventDetailPage'));
const OnlineTraining = lazy(() => import('./pages/OnlineTrainingPage'));
const TrainingDetail = lazy(() => import('./pages/TrainingDetailPage'));
const Coaches = lazy(() => import('./pages/CoachesPage'));
const CoachProfile = lazy(() => import('./pages/CoachProfilePage'));
const Contact = lazy(() => import('./pages/ContactPage'));
const Faq = lazy(() => import('./pages/FaqPage'));
const SizeGuide = lazy(() => import('./pages/SizeGuidePage'));
const Search = lazy(() => import('./pages/SearchPage'));
const OrderTracking = lazy(() => import('./pages/OrderTrackingPage'));
const OrderDetail = lazy(() => import('./pages/OrderDetailPage'));
const Legal = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFoundPage'));
const Compare = lazy(() => import('./pages/ComparePage'));
const Favorites = lazy(() => import('./pages/FavoritesPage'));
const Account = lazy(() => import('./pages/AccountPage'));
const Offline = lazy(() => import('./pages/OfflinePage'));
const Help = lazy(() => import('./pages/HelpPage'));

export default function App() {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main-content">
        <RouteExperience>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:category" element={<Shop />} />
              <Route path="/shop/:category/:subcategory" element={<Shop />} />
              <Route path="/products/:slug" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutStatus status="success" />} />
              <Route path="/checkout/cancelled" element={<CheckoutStatus status="cancelled" />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:slug" element={<ProgramDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/online-training" element={<OnlineTraining />} />
              <Route path="/online-training/:slug" element={<TrainingDetail />} />
              <Route path="/coaches" element={<Coaches />} />
              <Route path="/coaches/:slug" element={<CoachProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/help" element={<Help />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/search" element={<Search />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/order-tracking/:orderNumber" element={<OrderDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Navigate to="/account?section=orders" replace />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/privacy-policy" element={<Legal docKey="privacy-policy" />} />
              <Route path="/terms" element={<Legal docKey="terms" />} />
              <Route path="/cookies" element={<Legal docKey="cookies" />} />
              <Route path="/shipping-returns" element={<Legal docKey="shipping-returns" />} />
              <Route path="/refund-policy" element={<Legal docKey="refund-policy" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteExperience>
      </main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
      <PwaPrompt />
    </>
  );
}
