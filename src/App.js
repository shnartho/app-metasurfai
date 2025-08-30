import NavBar from "./components/NavBar";
import AdHandler from "./components/ads/AdHandling";
import Profile from "./components/profile/profile";
import React, { useState, useEffect } from 'react';
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
import Modal from 'react-modal';
import { ToastProvider } from "./components/Toast/ToastContext";
import { balanceUtils } from "./utils/balanceUtils";
import "./styles/toast.css";
    
Modal.setAppElement('#app');

const App = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [DarkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('DarkMode');
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
    localStorage.setItem('DarkMode', DarkMode);
  }, [DarkMode]);

  // Clean up any balance inconsistencies on app load
  useEffect(() => {
    const cleanup = () => {
      try {
        balanceUtils.forceCleanup();
      } catch (error) {
        console.warn('[App] Balance cleanup failed:', error);
      }
    };
    
    // Run cleanup after a short delay to allow other components to initialize
    const timer = setTimeout(cleanup, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!DarkMode);
  };

  // Only show filter on main page
  const showFilter = location.pathname === '/';

  return (
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
            <Route path="/stream" element={<Stream />} />
            <Route path="/vr" element={<VR />} />
            <Route path="/billboards" element={<Billboard />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  </div>
  </ToastProvider>
  );
};

export default App;