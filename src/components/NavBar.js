import { useState, useEffect } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import LoginForm from './Login/Login';
import SignUpForm from './Signup/Signup';
import { useNavigate } from "react-router-dom";
import Glocation from '../components/Glocation';

// Create a simple Add Ad Modal component within NavBar
const SimpleAddAdModal = ({ onClose }) => {
    const [adForm, setAdForm] = useState({
        title: '',
        image_url: '',
        description: '',
        max_views: 0,
        region: '',
        token_reward: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const profile = JSON.parse(localStorage.getItem('userProfile'));

        try {
            const adData = {
                title: adForm.title,
                image_url: adForm.image_url,
                description: adForm.description,
                posted_by: profile?.email || '',
                max_views: parseInt(adForm.max_views),
                region: adForm.region,
                token_reward: parseFloat(adForm.token_reward),
                view_count: 0,
                active: true
            };

            const response = await fetch('https://metasurfai-public-api.fly.dev/v2/ads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adData)
            });

            if (response.ok) {
                alert('Ad created successfully!');
                onClose();
            } else {
                const errorData = await response.json();
                alert(`Error creating ad: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            alert('Error creating ad. Please try again.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Create New Ad
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title:
                    </label>
                    <input
                        type="text"
                        value={adForm.title}
                        onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image URL:
                    </label>
                    <input
                        type="url"
                        value={adForm.image_url}
                        onChange={(e) => setAdForm({...adForm, image_url: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description:
                    </label>
                    <textarea
                        value={adForm.description}
                        onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows="3"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Views:
                    </label>
                    <input
                        type="number"
                        value={adForm.max_views}
                        onChange={(e) => setAdForm({...adForm, max_views: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="1"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Region:
                    </label>
                    <input
                        type="text"
                        value={adForm.region}
                        onChange={(e) => setAdForm({...adForm, region: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Token Reward:
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={adForm.token_reward}
                        onChange={(e) => setAdForm({...adForm, token_reward: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-pink-600 dark:bg-blue-600 hover:bg-pink-700 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Create Ad
                    </button>
                </div>
            </form>
        </div>
    );
};

const NavBar = ({ DarkMode, toggleDarkMode, toggleSidebar }) => {
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const profile = localStorage.getItem('userProfile');
        
        if (token && profile) {
            setIsAuthenticated(true);
            setUserProfile(JSON.parse(profile));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        setIsAuthenticated(false);
        setUserProfile(null);
        window.location.reload();
    };

    const openMapModal = () => {
        setActiveForm('map');
    };

    const openLoginForm = () => {
        console.log('Opening Login Form');
        setActiveForm('login');
    };

    const openSignUpForm = () => {
        console.log('Opening Sign Up Form');
        setActiveForm('signup');
    };

    const openAddAdsForm = () => {
        console.log('Opening Add Ads Form');
        setActiveForm('ad');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const Connect = { link: 'Connect', Path: '/Connect' };

    return (
        <div className={`navbar dark:bg-slate-900 ${DarkMode && 'Dark'}`}>
            {/* Side menu */}
            <div className='pl-3 pr-4 nav-item sidebtn'>
                <img src={'/MenuIcon.svg'} alt="MetaSurf Logo" width={30} height={30} className='pl-2 icon-dark-mode' onClick={toggleSidebar} />
            </div>
            <div className="flex-1 nav-item">
                <a href="/" className="btn btn-ghost flex">
                    <img src={DarkMode ? '/LogoDark.png' : '/Logo.png'} alt="MetaSurf Logo" width={36} height={36} className='rounded-xl' />
                    <span className='dark:text-white text-black text-2xl font-Oxanium'>MetaSurfAI</span>
                </a>
            </div>

            {/* Search bar */}
            <div className="flex flex-grow lg:flex items-center relative searchbar">
                <img src={'/search.svg'} alt="Search Icon" width={20} height={20} className='absolute left-3 icon-dark-mode' />
                <input type="text" placeholder="Search" className="text-black dark:text-white bg-slate-50 dark:bg-transparent outline-pink-600 dark:outline-blue-600 outline-none py-1 pl-10 px-3 w-72 rounded-2xl" />
            </div>

            {/* Nav items */}
            <div className='flex items-center space-x-3 mbtns'>
                <button className='buttonn w-9 h-9' onClick={openMapModal}>
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    M
                </button>
                
                {/* Show + button only if authenticated */}
                {isAuthenticated && (
                    <button className='buttonn w-9 h-9 mbtns' onClick={openAddAdsForm}>
                        <span className="hoverEffect">
                            <div></div>
                        </span>
                        +
                    </button>
                )}
                
                <a href={Connect.Path}>
                    <button className='buttonn mbtns'>
                        <span className="hoverEffect">
                            <div></div>
                        </span>
                        {Connect.link}
                    </button>
                </a>
                
                {/* Show different buttons based on authentication state */}
                {!isAuthenticated ? (
                    <a onClick={openLoginForm}>
                        <button className='buttonn mbtns'>
                            <span className="hoverEffect">
                                <div></div>
                            </span>
                            Login
                        </button>
                    </a>
                ) : (
                    <>
                        <a onClick={() => navigate('/Dashboard')}>
                            <button className='buttonn mbtns'>
                                <span className="hoverEffect">
                                    <div></div>
                                </span>
                                Profile
                            </button>
                        </a>
                        <a onClick={handleLogout}>
                            <button className='buttonn mbtns'>
                                <span className="hoverEffect">
                                    <div></div>
                                </span>
                                Logout
                            </button>
                        </a>
                    </>
                )}
                
                <button className='items buttonn w-9 h-9 flex justify-center items-center mbtns' onClick={toggleDarkMode}>
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    {DarkMode ? '🌞' : '🌙'}
                </button>
            </div>

            {/* Mobile menu */}
            <div className="mobile-menu relative nav-item">
                <button className="btn-sm btn-active btn-neutral" onClick={toggleMenu}>Menu</button>
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-gray-800 z-50 flex justify-center items-center">
                        <div className="bg-gray w-full h-full p-4 relative">
                            <button className=" absolute top-4 right-4 text-gray-400 text-3xl" onClick={toggleMenu}>
                                &times;
                            </button>
                            <ul className="py-1 mt-8">
                                <li><a className="block px-4 py-2 text-lg text-gray-400">{Connect.link}</a></li>
                                {isAuthenticated ? (
                                    <>
                                        <li><a className="block px-4 py-2 text-lg text-gray-400" onClick={() => { navigate('Dashboard'); toggleMenu(); }}>Dashboard</a></li>
                                        <li><a className="block px-4 py-2 text-lg text-gray-400" onClick={() => { openAddAdsForm(); toggleMenu(); }}>Create Ad</a></li>
                                        <li><a className="block px-4 py-2 text-lg text-gray-400" onClick={() => { handleLogout(); toggleMenu(); }}>Logout</a></li>
                                    </>
                                ) : (
                                    <>
                                        <li><a className="block px-4 py-2 text-lg text-gray-400" onClick={() => { openLoginForm(); toggleMenu(); }}>Login</a></li>
                                        <li><a className="block px-4 py-2 text-lg text-gray-400" onClick={() => { openSignUpForm(); toggleMenu(); }}>Signup</a></li>
                                    </>
                                )}
                                <li><a className='block px-4 py-2 text-lg text-gray-400' onClick={() => { navigate('live'); toggleMenu(); }}>Live</a></li>
                                <li className='block px-4 py-2 text-lg text-gray-400' onClick={() => { toggleDarkMode(); toggleMenu(); }}>Theme</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

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
                        zIndex: 1000
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
                {activeForm === 'login' && <LoginForm onClose={() => setActiveForm(null)} />}
                {activeForm === 'signup' && <SignUpForm onSwitchToLogin={() => setActiveForm('login')} />}
                {activeForm === 'ad' && <SimpleAddAdModal onClose={() => setActiveForm(null)} />}
                {activeForm === 'map' && <Glocation />}
            </ReactModal>
        </div>
    );
};

export default NavBar;