import { useState, useEffect } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import LoginForm from './Login/Login';
import SignUpForm from './Signup/Signup';
import { useNavigate } from "react-router-dom";

const NavBar = ({ DarkMode, toggleDarkMode, toggleSidebar }) => {

    const navigate = useNavigate();

    const [activeForm, setActiveForm] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const openLoginForm = () => {
        setActiveForm('login');
    };

    const openSignUpForm = () => {
        setActiveForm('signup');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleAuth = (formType) => {
        setIsAuthOpen(!isAuthOpen);
        setActiveForm(formType);
    };

    const closeAuth = () => {
        setIsAuthOpen(false);
        setActiveForm(null);
    };

    const NavItems = [
        { link: 'Watch', Path: '/Watch' },
        { link: 'Explore', Path: '/Explore' }
    ];

    const Connect = { link: 'Connect', Path: '/Connect' };

    return (
        <div className={`navbar dark:bg-slate-900 ${DarkMode && 'Dark'}`}>
            {/* side menu */}
            <div className='pl-3 pr-4 nav-item'>
                <img src={'/MenuIcon.svg'} alt="MetaSurf Logo" width={30} height={30} className='pl-2 icon-dark-mode' onClick={toggleSidebar}/>
            </div>
            <div className="flex-1 nav-item">
                <a href="/" className="btn btn-ghost flex">
                    <img src={DarkMode ? '/LogoDark.png' : '/Logo.png'} alt="MetaSurf Logo" width={36} height={36} className='rounded-xl'/>
                    <span className='dark:text-white text-black text-2xl font-Oxanium'>MetaSurfAI</span> 
                </a>
            </div>

             {/* Search bar */}
            <div className="flex flex-grow lg:flex items-center relative searchbar">
                <img src={'/search.svg'} alt="Search Icon" width={20} height={20} className='absolute left-3 icon-dark-mode'/>
                <input type="text" placeholder="Search" className="text-black dark:text-white bg-slate-50 dark:bg-transparent outline-pink-600 dark:outline-blue-600 outline-none py-1 pl-10 px-3 w-72 rounded-2xl" />
            </div>
            <div className='lg:flex items-center items'>
                <a href={Connect.Path}>
                <button className='buttonn'>
                    <span className="hoverEffect">
                    <div></div>
                    </span>
                    {Connect.link}
                  </button>
                </a>
            </div>
            <div className='lg:flex items-center px-3 items'>
            <a onClick={openLoginForm}>
                    <button className='buttonn'>
                    <span className="hoverEffect">
                        <div></div>
                    </span>
                    Login
                  </button>
                </a>
            </div>
            <button className='items buttonn w-9 h-9 flex justify-center items-center' onClick={toggleDarkMode}>
                <span className="hoverEffect">
                <div></div>
                </span>
                {DarkMode ? '🌞' : '🌙'}
                </button>
            {/* <div className="flex-none dropdown-menu"> 
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img alt="User Avatar" src={profileImage} />
                        </div>
                    </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow flex flex-col gap-2">
                    <li>
                        <a className="py-2 px-4 justify-between flex items-center w-full"
                        onClick={() => navigate('profile')}
                        >Profile</a>
                    </li>
                    <li>
                        <a className="py-2 px-4 flex items-center w-full">Settings</a>
                    </li>
                    <li>
                        <a onClick={openSignUpForm}
                        className="py-2 px-4 transition-all duration-300 rounded-2xl w-full"
                        >Signup</a>
                    </li>
                    <li>
                        <a onClick={openLoginForm}
                        className="py-2 px-4 transition-all duration-300 rounded-2xl w-full"
                        >Login</a>
                    </li>
                </ul>
            </div>
            </div> */}
        {/* Mobile menu */}
        <div className="mobile-menu relative nav-item">
            <button className="btn-sm btn-active btn-neutral" onClick={toggleMenu}>Menu</button>
            {isMenuOpen && (
                <div className="fixed inset-0 bg-gray-800 z-50 flex justify-center items-center">
                    <div className="bg-gray w-full h-full p-4 relative">
                        <button className="absolute top-4 right-4 text-gray-400 text-3xl" onClick={toggleMenu}>
                            &times;
                        </button>
                        <ul className="py-1 mt-8">
                            <li><a className="block px-4 py-2 text-lg text-gray-400" >{Connect.link}</a></li>
                            <li><a className="block px-4 py-2 text-lg text-gray-400"   
                            onClick={() => { navigate('Dashboard'); toggleMenu();}}>Dashboard</a></li>
                            <li><a className="block px-4 py-2 text-lg text-gray-400"
                            onClick={() => { openLoginForm(); toggleMenu();}}>Login</a></li>
                            <li><a className="block px-4 py-2 text-lg text-gray-400"
                            onClick={() => { openSignUpForm(); toggleMenu();}}>Signup</a></li>
                            <li> <a className='block px-4 py-2 text-lg text-gray-400'
                            onClick={() => { navigate('live'); toggleMenu(); }}>Live</a></li>
                            <li className='block px-4 py-2 text-lg text-gray-400'
                             onClick={() => { toggleDarkMode(); toggleMenu(); }}>Theme</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>

        {/* Render authentication modal */}
        {activeForm && (
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
                        background: 'trasparent',
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '4px',
                        outline: 'none',
                        padding: '20px',
                        zIndex: 1001
                    }
                }}
            >
                {activeForm === 'login' ? <LoginForm /> : <SignUpForm />}
            </ReactModal>
        )}
    </div>
);
};

export default NavBar;