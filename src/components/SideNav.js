import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SideNav = ({ isOpen }) => {
    const navigate = useNavigate();
    
    const menuItems = [
        { name: 'Home', icon: '/home.png', path: '/' },
        { name: 'Videos', icon: '/videos.png', path: '/videos' },
        { name: 'Markets', icon: '/markets.png', path: '/markets' },
        { name: 'VR', icon: '/vr.png', path: '/vr' },
        { name: 'Channels', icon: '/channels.png', path: '/channels' },
        { name: 'Stream', icon: '/stream.png', path: '/stream' },
        { name: 'Billboard', icon: '/billboard.png', path: '/billboard' },
        { name: 'Radio', icon: '/radio.png', path: '/radio' }
    ];

    return (
        <div className={`relative left-0 min-h-full overflow-y-auto bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 ${
            isOpen ? 'w-60' : 'w-20'
        }`}>
            <div className="flex flex-col justify-between min-h-full">
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
          </div>
        </div>
    );
};

export default SideNav;