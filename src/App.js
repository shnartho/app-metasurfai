import NavBar from "./components/NavBar";
import AdHandler from "./components/ads/AdHandling";
import Profile from "./components/profile/profile";
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

const App = () => {
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
    sessionStorage.setItem('darkMode', DarkMode);
  }, [DarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!DarkMode);
  };

  return (
    <div className={`flex flex-col min-h-screen bg-white dark:bg-slate-900 ${DarkMode ? 'dark' : ''}`}>
        <NavBar DarkMode={DarkMode} toggleDarkMode={toggleDarkMode} toggleSidebar={toggleSidebar}/>
        <div className="flex flex-grow">
          <SideNav isOpen={isSidebarOpen} />
          <div className={`flex-grow transition-all duration-300 ${
              isSidebarOpen ? 'ml-60' : 'ml-20'
          }`}>
            <div className="fixed top-10 first-letter:left-0 right-0 z-40 px-4 pt-2 bg-white dark:bg-slate-900 shadow-sm" style={{
                left: isSidebarOpen ? '240px' : '80px'
            }}>
                <Multifilter/>
            </div>
            <main className="mt-24 px-4">       
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
          </Routes>
        </main>
      </div>
    </div>
  </div>
  );
};

export default App;