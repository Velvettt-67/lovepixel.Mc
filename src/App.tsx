import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/footer/Footer';
import { PetalAtmosphere } from './components/cinematic/PetalAtmosphere';
import { BlossomCursor } from './components/cinematic/BlossomCursor';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HeavenlyBlossomEntrance } from './components/entrance/HeavenlyBlossomEntrance';
import { SupportProvider } from './context/SupportContext';
import { initSmoothScroll, destroySmoothScroll } from './animations/smoothScroll';

// Code-split pages for high performance and fast initial load
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const Management = lazy(() => import('./pages/Management').then(m => ({ default: m.Management })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Partners = lazy(() => import('./pages/Partners').then(m => ({ default: m.Partners })));
const Payouts = lazy(() => import('./pages/Payouts').then(m => ({ default: m.Payouts })));
const Gallery = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const AdminInbox = lazy(() => import('./pages/AdminInbox').then(m => ({ default: m.AdminInbox })));
const DevDiscordDebug = lazy(() => import('./pages/DevDiscordDebug').then(m => ({ default: m.DevDiscordDebug })));

// In-memory document lifecycle state:
// Resets to false on every full document load / browser refresh.
// Remains true across all client-side navigations (/community, /staff, etc.).
let sessionEnteredInMemory = false;

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Gentle page loading fallback
function PageLoadingFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#d3738b] border-t-transparent animate-spin mb-4" />
      <span className="font-editorial text-lg text-[#8b495d] tracking-wide">
        Entering LovePixels...
      </span>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-transition">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/management" element={<Management />} />
        <Route path="/staff" element={<Management />} />
        <Route path="/events" element={<Events />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin/inbox" element={<AdminInbox />} />
        <Route path="/dev/discord-debug" element={<DevDiscordDebug />} />
        {/* Catch-all fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export function App() {
  // Determine if the heavenly blossom entrance should be displayed
  const [showEntrance, setShowEntrance] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Clear any obsolete persistent sessionStorage keys from previous versions
    try {
      sessionStorage.removeItem('lovepixel_entered');
    } catch {
      // ignore
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('intro') === 'true' || urlParams.get('entrance') === 'true') {
      return true;
    }
    // On fresh document load / browser refresh, always show entrance if not entered in this lifecycle
    return !sessionEnteredInMemory;
  });

  useEffect(() => {
    initSmoothScroll();
    return () => {
      destroySmoothScroll();
    };
  }, []);

  // Allow replaying the entrance anytime via event
  useEffect(() => {
    const handleReplay = () => setShowEntrance(true);
    window.addEventListener('lovepixel_replay_entrance', handleReplay);
    return () => window.removeEventListener('lovepixel_replay_entrance', handleReplay);
  }, []);

  const handleEnterComplete = () => {
    sessionEnteredInMemory = true;
    setShowEntrance(false);
  };

  return (
    <BrowserRouter>
      <SupportProvider>
        {/* Global Custom Blossom Petal Precision Cursor (Active across Entrance and Entire Site) */}
        <BlossomCursor />

        {/* Cinematic Heavenly Blossom Entrance */}
        {showEntrance && <HeavenlyBlossomEntrance onEnter={handleEnterComplete} />}

        <div className="relative min-h-screen flex flex-col bg-[#0e050f] text-[#fdf2f4] selection:bg-[#d3738b]/30 selection:text-white overflow-x-hidden">
          {/* Soft Organic Atmospheric Petals Layer */}
          <PetalAtmosphere />

          {/* Scroll To Top Anchor */}
          <ScrollToTop />

          {/* Global Minimal Floating Navigation Bar */}
          <Navbar />


          {/* Main Content Router with Suspense and ErrorBoundary */}
          <main className="flex-1">
            <ErrorBoundary>
              <Suspense fallback={<PageLoadingFallback />}>
                <AnimatedRoutes />
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Global Cinematic Editorial Footer */}
          <Footer />
        </div>
      </SupportProvider>
    </BrowserRouter>
  );
}

export default App;
