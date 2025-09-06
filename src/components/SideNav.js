import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from './Footer';

const SideNav = ({ isOpen, DarkMode }) => {
    const navigate = useNavigate();
    
    const menuItems = [
        { name: 'Home', icon: '/home.png', path: '/' },
        { name: 'Live', icon: '/stream.png', path: '/Live' },
        { name: 'Videos', icon: '/videos.png', path: '/videos' },
        { name: 'Markets', icon: '/markets.png', path: '/markets' },
        { name: 'VR', icon: '/vr.png', path: '/vr' },
        { name: 'Channels', icon: '/channels.png', path: '/channels' },
        { name: 'Billboard', icon: '/billboard.png', path: '/billboards' },
        { name: 'Radio', icon: '/radio.png', path: '/radio' },
        { name: 'Metaverse', icon: '/metaverse.png', path: '/metaverse' },
        { name: 'Game', icon: '/game.png', path: '/game' },
        { name: 'Duet', icon: '/duet.png', path: '/duet' }
    ];

    return (
        <div className={`fixed left-0 top-12 h-[calc(100vh-48px)] overflow-y-auto bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 hidden md:block ${
            isOpen ? 'w-60' : 'w-20'
        }`}>
            <div className="flex flex-col  h-full">
            <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-3">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center cursor-pointer p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-blue-900 group ${
                            isOpen ? 'justify-start' : 'flex-col justify-center'
                        }`}
                    >
                        <img 
                            src={item.icon} 
                            alt={item.name}
                            className="w-6 h-6 object-contain icon-dark-mode"
                        />
                        <span className={`text-black dark:text-white font-Oxanium ${
                            isOpen 
                                ? 'ml-3' 
                                : 'text-xs mt-1 group-hover:text-pink-600 dark:group-hover:text-blue-600 '
                        }`}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
            <div
            className={`p-3 cursor-pointer hover:bg-pink-100 dark:hover:bg-blue-900 group ${
                isOpen ? 'flex items-center justify-start' : 'flex flex-col items-center'
            }`}
            onClick={() => navigate('/settings')}
        >
            <img 
                src="/settings.png" 
                alt="Settings"
                className="w-6 h-6 object-contain icon-dark-mode"
            />
            <span
                className={`text-black dark:text-white font-Oxanium ${
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