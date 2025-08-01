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
        imageFile: null,
        description: '',
        max_views: 0,
        region: '',
        token_reward: ''
    });

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setAdForm(prev => ({
    //             ...prev,
    //             imageFile: file,
    //             image_url: '' 
    //         }));
    //     }
    // };

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

    //create ad api
    // const handleSubmitN = async (e) => {
    //     e.preventDefault();
    //     const token = localStorage.getItem('authToken');
    //     const profile = JSON.parse(localStorage.getItem('userProfile'));

    //     if (!token) {
    //         alert('Authentication required. Please login.');
    //         return;
    //     }

    //     try {
    //         let imageUrl = adForm.image_url;

    //         // If there's a file to upload (assuming you have a file input)
    //         if (adForm.imageFile) {
    //             // Step 1: Upload image/video to get URL
    //             const formData = new FormData();
    //             formData.append('image', adForm.imageFile);

    //             const uploadResponse = await fetch('https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/dev/images', {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     // Don't set Content-Type for FormData - browser will set it with boundary
    //                 },
    //                 body: formData
    //             });

    //             if (!uploadResponse.ok) {
    //                 throw new Error(`Image upload failed: ${uploadResponse.status}`);
    //             }

    //             const getImageResponse = await fetch('https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/dev/images', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //             }
    //         });

    //         if (!getImageResponse.ok) {
    //             throw new Error(`Failed to retrieve image URL: ${getImageResponse.status}`);
    //         }

    //         const imageData = await getImageResponse.json();
    //         imageUrl = imageData.url || imageData.image_url; // Adjust based on API response
    //         console.log('Retrieved image URL:', imageUrl);
    //     }

    //         // Step 3: Create ad with the image URL
    //         const adData = {
    //             title: adForm.title,
    //             image_url: imageUrl,
    //             description: adForm.description,
    //             posted_by: profile?.email || '',
    //             max_views: parseInt(adForm.max_views),
    //             region: adForm.region,
    //             token_reward: parseFloat(adForm.token_reward),
    //             view_count: 0,
    //             active: true
    //         };

    //         const adResponse = await fetch('https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/dev/ads', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(adData)
    //         });

    //         if (adResponse.ok) {
    //             const result = await adResponse.json();
    //             console.log('Ad created successfully:', result);
    //             alert('Ad created successfully!');
    //             onClose();
    //         } else {
    //             const errorData = await adResponse.json();
    //             alert(`Error creating ad: ${errorData.message || 'Unknown error'}`);
    //         }

    //     } catch (err) {
    //         console.error('Error in ad creation process:', err);
    //         alert('Error creating ad. Please try again.');
    //     }
    // };

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

                {/* Handle file upload */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image URL:
                    </label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div> */}

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

    const Connect = { link: 'Connect', Path: '/Connect' };

    return (
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
                            {userProfile.localBalance?.toFixed(2) || '0.00'}
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
                
                <a href={Connect.Path}>
                    <button className='buttonn mbtns transform hover:scale-105 transition-all duration-200'>
                        <span className="hoverEffect">
                            <div></div>
                        </span>
                        {Connect.link}
                    </button>
                </a>

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

            {/* Mobile menu */}
            <div className="mobile-menu relative nav-item">
                <button 
                    className="btn-sm btn-active btn-neutral transform hover:scale-105 transition-all duration-200" 
                    onClick={toggleMenu}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 w-full h-full p-4 relative animate-slideIn">
                            <button 
                                className="absolute top-4 right-4 text-gray-400 text-3xl hover:text-red-500 transition-colors duration-200" 
                                onClick={toggleMenu}
                            >
                                &times;
                            </button>
                            <ul className="py-1 mt-8 space-y-4">
                                <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200">{Connect.link}</a></li>
                                {isAuthenticated ? (
                                    <>
                                        <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200" onClick={() => { navigate('Dashboard'); toggleMenu(); }}>Dashboard</a></li>
                                        <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200" onClick={() => { openAddAdsForm(); toggleMenu(); }}>Create Ad</a></li>
                                        <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-red-500 transition-colors duration-200" onClick={() => { handleLogout(); toggleMenu(); }}>Logout</a></li>
                                    </>
                                ) : (
                                    <>
                                        <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200" onClick={() => { openLoginForm(); toggleMenu(); }}>Login</a></li>
                                        <li><a className="block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200" onClick={() => { openSignUpForm(); toggleMenu(); }}>Signup</a></li>
                                    </>
                                )}
                                <li><a className='block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200' onClick={() => { navigate('live'); toggleMenu(); }}>Live</a></li>
                                <li className='block px-4 py-3 text-lg text-gray-400 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-200' onClick={() => { toggleDarkMode(); toggleMenu(); }}>
                                    Theme: {DarkMode ? 'Dark' : 'Light'}
                                </li>
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
                {activeForm === 'login' && <LoginForm onClose={() => setActiveForm(null)} />}
                {activeForm === 'signup' && <SignUpForm onSwitchToLogin={() => setActiveForm('login')} />}
                {activeForm === 'ad' && <SimpleAddAdModal onClose={() => setActiveForm(null)} />}
                {activeForm === 'map' && <Glocation onClose={() => setActiveForm(null)} />}
            </ReactModal>
        </div>
    );
};

export default NavBar;