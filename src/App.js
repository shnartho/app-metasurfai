import NavBar from "./components/NavBar";
import AdHandler from "./components/ads/AdHandling";
import Profile from "./components/profile/profile";
import React, { useState, useEffect, Component } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ToS from "./components/other/ToS";
import PrivacyPolicy from "./components/other/PrivacyP";
import About from "./components/other/About";
import UserDash from "./components/Dashboard/UserDash";
import LiveAds from "./components/live/LiveAds";
import Videos from "./components/Videos/Videos";
import Markets from "./components/Markets/Markets";
import Radio from "./components/Radio/Radio";
import Stream from "./components/Stream/Stream";
import VR from "./components/VR/vr";
import Billboard from "./components/Billboards/Billboard";
import Channels from "./components/Channels/Channels";
import SideNav from "./components/SideNav";
import Multifilter from "./components/ads/ads-filter/multifilter";
import Settings from "./components/settings/settings";
import Metaverse from "./components/Metaverse/Metaverse";
import Games from "./components/Game/Games";
import Duet from "./components/Duet/Duet";
import Connect from "./components/Connect/Connect";
import Modal from 'react-modal';
import { ToastProvider } from "./components/Toast/ToastContext";
import { balanceUtils } from "./utils/balanceUtils";
import storage from "./utils/storage";
import { isTokenExpired } from "./utils/auth";
import { STORAGE_KEYS } from "./constants";
import "./styles/toast.css";
    
Modal.setAppElement('#app');

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          height: '100vh', background: '#18181b', color: '#fff', fontFamily: 'sans-serif', padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Something went wrong</h1>
          <p style={{ fontSize: '1rem', maxWidth: 500, textAlign: 'center', marginBottom: '1rem' }}>
            We encountered an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px', fontSize: '1rem', background: '#3b82f6',
              color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Maintenance page component
function MaintenancePage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#18181b', color: '#fff', fontFamily: 'sans-serif', margin: 0
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚧 Under Maintenance 🚧</h1>
      <p style={{ fontSize: '1.25rem', maxWidth: 400, textAlign: 'center' }}>
        Our site is currently undergoing scheduled maintenance or is temporarily unavailable.<br />
        <br />
        Please check back soon.
      </p>
    </div>
  );
}

const App = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [DarkMode, setDarkMode] = useState(() => {
    const savedDarkMode = storage.get(STORAGE_KEYS.DARK_MODE);
    return savedDarkMode === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  useEffect(() => {
    if (DarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.set(STORAGE_KEYS.DARK_MODE, DarkMode);
  }, [DarkMode]);

  // Check token expiration and auto-logout if expired
  useEffect(() => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token && isTokenExpired(token)) {
      console.warn('[App] Token expired, logging out');
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_PROFILE);
      window.location.reload();
    }
  }, []);

  // Clean up any balance inconsistencies on app load and check for incognito mode
  useEffect(() => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        // Try to detect if we're in incognito mode 
        // If localStorage is empty but token exists, we might be in incognito
        const profile = storage.getJSON(STORAGE_KEYS.USER_PROFILE);
        if (!profile || !profile?.balance) {
          // Fetch balance from backend for incognito mode
          balanceUtils.fetchBalanceFromBackend().catch(err => {
            console.warn('[App] Failed to fetch balance:', err);
          });
        } else {
          // For regular mode, just clean up any inconsistencies
          balanceUtils.forceCleanup();
        }
      } catch (error) {
        console.warn('[App] Balance init failed:', error);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!DarkMode);
  };

  // Only show filter on main page
  const showFilter = location.pathname === '/';

  if (process.env.NEXT_PUBLIC_UNDER_MAINTENANCE === 'true') {
    return <MaintenancePage />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={`flex flex-col min-h-screen bg-white dark:bg-slate-900 ${DarkMode ? 'dark' : ''}`}>
            <NavBar DarkMode={DarkMode} toggleDarkMode={toggleDarkMode} toggleSidebar={toggleSidebar}/>
            <div className="flex flex-grow">
              <SideNav isOpen={isSidebarOpen} DarkMode={DarkMode} />
              <div className={`flex-grow transition-all duration-300 ${
                  isSidebarOpen ? 'md:ml-60' : 'md:ml-20'
              }`}>
              {showFilter && (
                <div className={`fixed top-16 md:top-12 left-0 right-0 z-40 pt-2 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 ${
                  isSidebarOpen ? 'md:left-60' : 'md:left-20'
                }`}>
                    <Multifilter isSidebarOpen={isSidebarOpen} />
                </div>
              )}
              <main className={`px-4 ${showFilter ? 'pt-28 md:pt-24' : 'pt-12'}`}>       
            <Routes>
              <Route path="/" element={<AdHandler />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/tos" element={<ToS />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/Dashboard" element={<UserDash />} />
              <Route path="/live" element={<LiveAds />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/radio" element={<Radio />} />
              {/* <Route path="/stream" element={<Stream />} /> */}
              <Route path="/vr" element={<VR />} />
              <Route path="/billboards" element={<Billboard />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/metaverse" element={<Metaverse />} />
              <Route path="/game" element={<Games />} />
              <Route path="/duet" element={<Duet />} />
              <Route path="/connect" element={<Connect />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
    </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;