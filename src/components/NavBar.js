import { useState, useEffect } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import menu from "../../public/icon-menu.png";
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

    const toggleisMenu = () => {
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
 <div className="flex items-center flex-grow">
                    <input type="text" placeholder="Search" className="bg-transparent outline-double outline-fuchsia-900 px-3 py-1 rounded-3xl" />
                </div>

            <div className='space-x-4 hidden lg:flex items-center px-10'>
                <a href={Connect.Path}>
                    <button className='bg-fuchsia-600 text-white py-2 px-4 transition-all duration-300 rounded-2xl  w-24 h-10 hover:bg-grey font-sans'>{Connect.link}</button>
                </a>
            </div>
            <div className="flex-none"> 
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img alt="User Avatar" src={profileImage} />
                        </div>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li>
                        <a className="justify-between" onClick={() => navigate('profile')}>
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li>
                            <button onClick={() => toggleAuth('signup')} className='py-2 px-4 transition-all duration-300 rounded-2xl w-full text-left'>Signup</button>
                        </li>
                        <li>
                            <button onClick={() => toggleAuth('login')} className='py-2 px-4 transition-all duration-300 rounded-2xl w-full text-left'>Login</button>
                        </li>
                    </ul>
                </div>
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