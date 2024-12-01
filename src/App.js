import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AdHandler from "./components/ads/AdHandling";
import Profile from "./components/profile/profile";
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ToS from "./components/other/ToS";
import PrivacyPolicy from "./components/other/PrivacyP";
import About from "./components/other/About";
import UserDash from "./components/Dashboard/UserDash";
import LiveAds from "./components/live/LiveAds";
import SideNav from "./components/SideNav";

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
          <main className={`flex-grow transition-all duration-300 ${
              isSidebarOpen ? 'ml-60' : 'ml-20'
          }`}>          
          <Routes>
            <Route path="/" element={<AdHandler />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/tos" element={<ToS />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/Dashboard" element={<UserDash />} />
            <Route path="/live" element={<LiveAds />} />
          </Routes>
        </main>
      </div>
        <Footer DarkMode={DarkMode} />
      </div>
  );
};

export default App;