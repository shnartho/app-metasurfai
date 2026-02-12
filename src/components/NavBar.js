import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import LoginForm from './Login/Login';
import SignUpForm from './Signup/Signup';
import { useNavigate, useLocation } from "react-router-dom";
import Glocation from '../components/Glocation';
import AddAdModal from './ads/AddAdModal';
import { cacheUtils } from '../utils/apiCache';
import { apiCall } from '../utils/api';
import Connect from './Connect/Connect';

const NavBar = ({ DarkMode, toggleDarkMode, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeForm, setActiveForm] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Helper function to check if a path is active
    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path;
    };

    // Helper function to get active classes for navigation items
    const getActiveClasses = (path) => {
        if (isActivePath(path)) {
            return 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-pink-300 dark:border-blue-500';
        }
        return 'hover:text-pink-500 dark:hover:text-blue-500';
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const profile = localStorage.getItem('userProfile');
        
        if (token && profile) {
            setIsAuthenticated(true);
            setUserProfile(JSON.parse(profile));
        }

        // Listen for localStorage changes to update balance in real-time
        const handleStorageChange = () => {
            const updatedProfile = localStorage.getItem('userProfile');
            if (updatedProfile) {
                setUserProfile(JSON.parse(updatedProfile));
            }
        };

        // Listen for successful login events
        const handleUserLogin = (event) => {
            const { profile, token } = event.detail;
            setIsAuthenticated(true);
            setUserProfile(profile);
            // Reload page to refresh all states and components
            window.location.reload();
        };

        // Custom event listeners
        window.addEventListener('profileUpdated', handleStorageChange);
        window.addEventListener('userLoggedIn', handleUserLogin);
        
        return () => {
            window.removeEventListener('profileUpdated', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleUserLogin);
        };
    }, []);

    const handleLogout = async () => {
        // Call backend logout to invalidate tokens (best-effort)
        try {
            const token = localStorage.getItem('authToken');
            const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
            if (token && isNewApi) {
                await apiCall('logout', { token, base: 'new' });
            }
        } catch (e) {
            console.warn('[NavBar] Backend logout failed (proceeding anyway):', e);
        }

        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        
        // Disconnect wallet on logout
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('walletAddress');
        
        // Clear all cached data for current user
        cacheUtils.clearAllOnLogout();
        
        // Reset state
        setIsAuthenticated(false);
        setUserProfile(null);
        
        // Reload and navigate
        window.location.reload();
        navigate('/');
    };

    const openMapModal = () => {
        setActiveForm('map');
    };

    const openLoginForm = () => {
        setActiveForm('login');
    };

    const openSignUpForm = () => {
        setActiveForm('signup');
    };

    const openAddAdsForm = () => {
        setActiveForm('ad');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Remove the hardcoded Connect object since we're using the component now

    return (
        <>
            <div className={`navbar dark:bg-slate-900 ${DarkMode && 'Dark'} transition-all duration-300`}>
            {/* Side menu */}
            <div className='pl-3 pr-4 nav-item sidebtn'>
                <img 
                    src={'/MenuIcon.svg'} 
                    alt="MetaSurf Logo" 
                    width={30} 
                    height={30} 
                    className='pl-2 icon-dark-mode cursor-pointer transform hover:scale-110 transition-transform duration-200' 
                    onClick={toggleSidebar} 
                />
            </div>
            <div className="flex-1 nav-item">
                <a href="/" className="btn btn-ghost flex items-center hover:scale-105 transition-transform duration-300">
                    <img 
                        src={DarkMode ? '/LogoDark.png' : '/Logo.png'} 
                        alt="MetaSurf Logo" 
                        width={36} 
                        height={36} 
                        className='rounded-xl animate-pulse' 
                    />
                    <span className='dark:text-white text-black text-2xl font-Oxanium ml-2 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent'>
                        MetaSurfAI
                    </span>
                </a>
            </div>

            {/* Mobile Balance Display */}
            {isAuthenticated && userProfile && (
                <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 space-x-1 mr-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        ${userProfile.balance?.toFixed(2) || '0.00'}
                    </span>
                    <img 
                        src="/TokenLogo.png" 
                        alt="Token" 
                        className="w-4 h-4"                            
                    />
                </div>
            )}

            {/* Search bar */}
            <div className="flex flex-grow lg:flex items-center relative searchbar">
                <img 
                    src={'/search.svg'} 
                    alt="Search Icon" 
                    width={20} 
                    height={20} 
                    className='absolute left-3 icon-dark-mode transition-colors duration-200' 
                />
                <input 
                    type="text" 
                    placeholder="Search ads, users, content..." 
                    className="text-black dark:text-white bg-slate-50 dark:bg-transparent outline-pink-600 dark:outline-blue-600 outline-none py-2 pl-10 px-3 w-72 rounded-2xl border-2 border-transparent hover:border-pink-300 dark:hover:border-blue-300 focus:border-pink-500 dark:focus:border-blue-500 transition-all duration-300" 
                />
            </div>

            {/* Nav items */}
            <div className='flex items-center space-x-3 mbtns'>
                {/* Show current balance for authenticated users */}
                {isAuthenticated && userProfile && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 space-x-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {userProfile.balance?.toFixed(2) || '0.00'}
                        </span>
                        <div className='buttonn mbtns flex items-center justify-center transform hover:scale-110 transition-all duration-200 cursor-default'>
                            <span className="hoverEffect">
                                <div></div>
                            </span>
                            <img 
                                src="/TokenLogo.png" 
                                alt="Token" 
                                className="icon-dark-mode transition-colors duration-200 w-5 h-5"                            
                                />
                        </div>
                    </div>
                )}
                {isAuthenticated && (
                <button 
                    className='buttonn mbtns flex items-center justify-center transform hover:scale-110 transition-all duration-200' 
                    onClick={openMapModal}
                >
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    <img 
                        src="/map.png" 
                        alt="Map" 
                        className="icon-dark-mode transition-colors duration-200 w-5 h-5" 
                    />
                </button>
                )}
                {/* Show + button only if authenticated */}
                {isAuthenticated && (
                    <button 
                        className='buttonn mbtns transform hover:scale-110 transition-all duration-300' 
                        onClick={openAddAdsForm}
                    >
                        <span className="hoverEffect">
                            <div></div>
                        </span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
                
                {/* Connect Wallet Dropdown - Only for authenticated users */}
                {isAuthenticated && (
                    <Connect isDropdown={true} />
                )}

                {/* Show different buttons based on authentication state */}
                {!isAuthenticated ? (
                    <a onClick={openLoginForm}>
                        <button className='buttonn mbtns transform hover:scale-105 transition-all duration-200'>
                            <span className="hoverEffect">
                                <div></div>
                            </span>
                            Login
                        </button>
                    </a>
                ) : (
                    <>
                        <a onClick={() => navigate('/Dashboard')}>
                            <button className='buttonn mbtns transform hover:scale-105 transition-all duration-200'>
                                <span className="hoverEffect">
                                    <div></div>
                                </span>
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Profile
                            </button>
                        </a>
                        <a onClick={handleLogout}>
                            <button className='buttonn mbtns transform hover:scale-105 transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900'>
                                <span className="hoverEffect">
                                    <div></div>
                                </span>
                                Logout
                            </button>
                        </a>
                    </>
                )}
                
                <button 
                    className='items buttonn w-10 h-10 flex justify-center items-center mbtns transform hover:scale-110 hover:rotate-12 transition-all duration-300' 
                    onClick={toggleDarkMode}
                >
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    {DarkMode ? '🌞' : '🌙'}
                </button>
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu nav-item">
                <button 
                    className='buttonn flex items-center justify-center transform hover:scale-110 transition-all duration-200' 
                    onClick={toggleMenu}
                >
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            </div>

            {/* Mobile menu overlay - outside navbar container */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-900 w-full h-full p-4 relative animate-slideIn overflow-y-auto">
                        <button 
                            className="absolute top-4 right-4 w-10 h-10 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 z-10 transform hover:scale-110" 
                            onClick={toggleMenu}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <ul className="py-1 mt-8 space-y-4">
                            {/* Navigation Links from Sidebar */}
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/'); toggleMenu(); }}>
                                <img src="/home.png" alt="Home" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Home
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/markets') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/markets'); toggleMenu(); }}>
                                <img src="/markets.png" alt="Markets" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Markets
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/live') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/Live'); toggleMenu(); }}>
                                <img src="/live.png" alt="Live" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Live
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/videos') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/videos'); toggleMenu(); }}>
                                <img src="/videos.png" alt="Videos" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Videos
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/vr') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/vr'); toggleMenu(); }}>
                                <img src="/vr.png" alt="VR" className="w-6 h-6 mr-3 icon-dark-mode" />
                                VR
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/channels') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/channels'); toggleMenu(); }}>
                                <img src="/channels.png" alt="Channels" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Channels
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/stream') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/stream'); toggleMenu(); }}>
                                <img src="/stream.png" alt="Stream" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Stream
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/billboards') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/billboards'); toggleMenu(); }}>
                                <img src="/billboard.png" alt="Billboard" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Billboard
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/radio') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/radio'); toggleMenu(); }}>
                                <img src="/radio.png" alt="Radio" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Radio
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/metaverse') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/metaverse'); toggleMenu(); }}>
                                <img src="/metaverse.png" alt="Metaverse" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Metaverse
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/game') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/game'); toggleMenu(); }}>
                                <img src="/game.png" alt="Game" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Game
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/duet') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/duet'); toggleMenu(); }}>
                                <img src="/duet.png" alt="Duet" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Duet
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/settings') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/settings'); toggleMenu(); }}>
                                <img src="/settings.png" alt="Settings" className="w-6 h-6 mr-3 icon-dark-mode" />
                                Settings
                            </a></li>
                            
                            {/* Divider */}
                            <li><hr className="border-gray-300 dark:border-gray-600 my-2" /></li>
                            
                            {/* Connect Wallet for authenticated users */}
                            {isAuthenticated && (
                                <li className="px-4 py-3">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Wallet Connection</h3>
                                    <Connect />
                                </li>
                            )}
                            
                            {/* Additional Mobile Menu Items */}
                            
                            {/* Authentication dependent options */}
                            {isAuthenticated ? (
                                <>
                                    <li><a className="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={() => { openMapModal(); toggleMenu(); }}>
                                        <img src="/map.png" alt="Map" className="w-6 h-6 mr-3 icon-dark-mode" />
                                        Map
                                    </a></li>
                                    <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                        isActivePath('/Dashboard') 
                                            ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                            : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`} onClick={() => { navigate('/Dashboard'); toggleMenu(); }}>
                                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Dashboard
                                    </a></li>
                                    <li><a className="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={() => { openAddAdsForm(); toggleMenu(); }}>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Ad
                                    </a></li>
                                    <li><a className="flex items-center px-4 py-3 text-lg text-red-500 hover:text-red-600 transition-colors duration-200 cursor-pointer" onClick={() => { handleLogout(); toggleMenu(); }}>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </a></li>
                                </>
                            ) : (
                                <>
                                    <li><a className="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={() => { openLoginForm(); toggleMenu(); }}>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Login
                                    </a></li>
                                    <li><a className="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={() => { openSignUpForm(); toggleMenu(); }}>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Signup
                                    </a></li>
                                </>
                            )}
                            
                            {/* Theme toggle */}
                            <li><hr className="border-gray-300 dark:border-gray-600 my-2" /></li>
                            <li className='flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200 cursor-pointer' onClick={() => { toggleDarkMode(); toggleMenu(); }}>
                                <span className="w-6 h-6 mr-3 text-xl flex items-center justify-center">
                                    {DarkMode ? '🌞' : '🌙'}
                                </span>
                                Theme: {DarkMode ? 'Light' : 'Dark'} Mode
                            </li>
                            
                            {/* Footer Content */}
                            <li><hr className="border-gray-300 dark:border-gray-600 my-2" /></li>
                            
                            {/* About Section */}
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/about') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/about'); toggleMenu(); }}>
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                About Us
                            </a></li>
                            
                            {/* Legal Section */}
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/privacy') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/privacy'); toggleMenu(); }}>
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Privacy Policy
                            </a></li>
                            <li><a className={`flex items-center px-4 py-3 text-lg transition-colors duration-200 cursor-pointer rounded-lg mx-2 ${
                                isActivePath('/tos') 
                                    ? 'bg-pink-100 dark:bg-blue-900 text-pink-600 dark:text-blue-400 border-l-4 border-pink-500 dark:border-blue-500' 
                                    : 'text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`} onClick={() => { navigate('/tos'); toggleMenu(); }}>
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Terms of Service
                            </a></li>
                            
                            {/* Social Media Section */}
                            <li><hr className="border-gray-300 dark:border-gray-600 my-2" /></li>
                            <li className="px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Follow Us</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <a href="#" className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200">
                                        <img src="/discord.svg" alt="Discord" className="w-6 h-6 icon-dark-mode" />
                                        <span>Discord</span>
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200">
                                        <img src="/twitter.svg" alt="Twitter" className="w-6 h-6 icon-dark-mode" />
                                        <span>Twitter</span>
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200">
                                        <img src="/github.svg" alt="GitHub" className="w-6 h-6 icon-dark-mode" />
                                        <span>GitHub</span>
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200">
                                        <img src="/linkedin.svg" alt="LinkedIn" className="w-6 h-6 icon-dark-mode" />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Render authentication modal */}
            <ReactModal
                isOpen={!!activeForm}
                onRequestClose={() => setActiveForm(null)}
                contentLabel="Authentication Modal"
                overlayClassName="modal-overlay"
                className="modal-content"
                style={{
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 1000,
                        backdropFilter: 'blur(8px)'
                    },
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'transparent',
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '0px',
                        outline: 'none',
                        border: 'none',
                        padding: '20px',
                        zIndex: 1001
                    }
                }}
            >
                {activeForm === 'login' && <LoginForm onClose={() => setActiveForm(null)} onSwitchToSignup={() => setActiveForm('signup')} />}
                {activeForm === 'signup' && <SignUpForm onSwitchToLogin={() => setActiveForm('login')} />}
                {activeForm === 'ad' && <AddAdModal isOpen={true} closeModal={() => setActiveForm(null)} />}
                {activeForm === 'map' && <Glocation onClose={() => setActiveForm(null)} />}
            </ReactModal>
        </>
    );
};

export default NavBar;