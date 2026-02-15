import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from './Footer';

const SideNav = ({ isOpen, DarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Helper function to check if a path is active
    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path;
    };
    
    const menuItems = [
        { name: 'Home', icon: '/home.png', path: '/' },
        { name: 'Markets', icon: '/markets.png', path: '/markets' },
        { name: 'Live', icon: '/stream.png', path: '/live' },
        { name: 'Billboard', icon: '/billboard.png', path: '/billboards' },
        { name: 'VR', icon: '/vr.png', path: '/vr' },
        { name: 'Channels', icon: '/channels.png', path: '/channels' },
        { name: 'Metaverse', icon: '/metaverse.png', path: '/metaverse' },
        { name: 'AI Ads Campaign', icon: '/ai_icon.svg', path: '/ai-ads-campaign' },
        { name: 'Radio', icon: '/radio.png', path: '/radio' },
        { name: 'Game', icon: '/game.png', path: '/game' },
        { name: 'Duet', icon: '/duet.png', path: '/duet' },
        { name: 'Videos', icon: '/videos.png', path: '/videos' }
    ];

    return (
        <div className={`fixed left-0 top-12 h-[calc(100vh-48px)] overflow-y-auto bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 hidden md:block ${
            isOpen ? 'w-60' : 'w-20'
        }`}>
            <div className="flex flex-col  h-full">
            <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-3">
                {menuItems.map((item, index) => {
                    const isActive = isActivePath(item.path);
                    return (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center cursor-pointer p-2 rounded-lg transition-all duration-200 group ${
                                isOpen ? 'justify-start' : 'flex-col justify-center'
                            } ${
                                isActive 
                                    ? 'bg-pink-100 dark:bg-blue-900 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'hover:bg-pink-100 dark:hover:bg-blue-900'
                            }`}
                        >
                            <img 
                                src={item.icon} 
                                alt={item.name}
                                className="w-6 h-6 object-contain icon-dark-mode"
                            />
                            <span className={`font-Oxanium transition-colors duration-200 ${
                                isActive 
                                    ? 'text-pink-600 dark:text-blue-400' 
                                    : 'text-black dark:text-white'
                            } ${
                                isOpen 
                                    ? 'ml-3' 
                                    : 'text-xs mt-1 group-hover:text-pink-600 dark:group-hover:text-blue-600'
                            }`}>
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div
            className={`p-3 cursor-pointer transition-all duration-200 group ${
                isOpen ? 'flex items-center justify-start' : 'flex flex-col items-center'
            } ${
                isActivePath('/settings')
                    ? 'bg-pink-100 dark:bg-blue-900 border-l-4 border-pink-500 dark:border-blue-500'
                    : 'hover:bg-pink-100 dark:hover:bg-blue-900'
            }`}
            onClick={() => navigate('/settings')}
        >
            <img 
                src="/settings.png" 
                alt="Settings"
                className="w-6 h-6 object-contain icon-dark-mode"
            />
            <span
                className={`font-Oxanium transition-colors duration-200 ${
                    isActivePath('/settings')
                        ? 'text-pink-600 dark:text-blue-400'
                        : 'text-black dark:text-white'
                } ${
                    isOpen 
                        ? 'ml-3' 
                        : 'text-xs mt-1 group-hover:text-pink-600 dark:group-hover:text-blue-600'
                }`}
            >
                Settings
            </span>
           </div>
           <div className="mt-auto">
                <Footer isOpen={isOpen} DarkMode={DarkMode}/>
           </div>
           </div>
          </div>
        </div>
    );
};

export default SideNav;