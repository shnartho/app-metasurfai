import { useState, useEffect } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import logo from "../../public/Logo.png";
import LoginForm from './Login/Login';
import SignUpForm from './Signup/Signup';
import { useNavigate } from "react-router-dom";


function NavBar(){

    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeForm, setActiveForm] = useState(null);
    const [profileImage, setProfileImage] = useState(logo); // Default to local logo

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

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
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-xl flex items-center space-x-3">
                    <img src={logo} alt="MetaSurf Logo" width={40} height={40} className='rounded-full'/>
                    <span className='text-white font-Oxanium text-2xl font-bold pt-2'>MetaSurfAi</span>
                </a>
            </div>

                {/* Search bar */}
                <div className="flex items-center flex-grow lg:flex searchbar">
                    <input type="text" placeholder="Search" className="bg-transparent outline-double outline-fuchsia-900 px-3 py-1 rounded-3xl" />
                </div>

            <div className='space-x-4 hidden lg:flex items-center px-10  connect-button-container'>
                <a href={Connect.Path}>
                    <button className='bg-fuchsia-600 text-white py-2 px-4 transition-all duration-300 rounded-2xl  w-24 h-10 hover:bg-grey font-sans connect-button'>{Connect.link}</button>
                </a>
            </div>
            <div className="flex-none dropdown-menu"> 
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img alt="User Avatar" src={profileImage} />
                        </div>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow flex flex-col gap-2">
                        <li>
                        <a className="justify-between" onClick={() => navigate('profile')}>
                                Profile</a>
                        </li>
                        <li><a>Settings</a></li>
                        <li>
                            <a onClick={() => toggleAuth('signup')} className='py-2 px-4 transition-all duration-300 rounded-2xl w-full text-left'>Signup</a>
                        </li>
                        <li>
                            <a onClick={() => toggleAuth('login')} className='py-2 px-4 transition-all duration-300 rounded-2xl w-full text-left'>Login</a>
                        </li>
                    </ul>
                </div>
            </div>
                       {/* Mobile menu */}
                       <div className="mobile-menu relative">
                <button className="btn-sm btn-active btn-neutral" onClick={toggleMenu}>Menu</button>
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-gray-800 z-50 flex justify-center items-center">
                        <div className="bg-gray w-full h-full p-4 relative">
                            <button className="absolute top-4 right-4 text-gray-400 text-3xl" onClick={toggleMenu}>
                                &times;
                            </button>
                            <ul className="py-1 mt-8">
                                <li><a className="block px-4 py-2 text-lg text-gray-400" >Connect</a></li>
                                <li><a className="block px-4 py-2 text-lg text-gray-400"   
                                onClick={() => { navigate('profile'); toggleMenu();}}>Profile</a></li>
                                <li><a className="block px-4 py-2 text-lg text-gray-400"
                                onClick={() => { toggleAuth('signup'); toggleMenu();}}>Login</a></li>
                                <li><a className="block px-4 py-2 text-lg text-gray-400"
                                onClick={() => { toggleAuth('login'); toggleMenu();}}>Signup</a></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Render authentication modal */}
            {isAuthOpen && (
                <ReactModal
                    isOpen={isAuthOpen}
                    onRequestClose={closeAuth}
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