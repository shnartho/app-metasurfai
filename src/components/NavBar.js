import { useState } from 'react';
import React from 'react';
import { Img } from 'react-image';
import ReactModal from 'react-modal';
import menu from "../../public/icon-menu.png";
import logo from "../../public/Logo.png";
import LoginForm from './Login/Login';
import SignUpForm from './Signup/SignUp';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeForm, setActiveForm] = useState(null);

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
        <header className='w-full bg-black'>
            <nav className='py-4 lg:px-14 px-4'>
                <div className='flex justify-between items-center text-base gap-8 text-white'>
                    <a href="/" className='text-2xl font-semibold flex items-center space-x-3 cursor-pointer'>
                        <Img src={logo} alt="MetaSurf Logo" width={40} height={40} />
                        <span className='text-white font-Oxanium text-2xl font-bold pt-2'>MetaSurfAi</span>
                    </a>

                    {/* For mobile users */}
                    <ul className='md:flex space-x-12 hidden'>
                        {NavItems.map(({ link, Path }) => (
                            <li key={Path}>
                                <a href={Path} className='block text-base text-white font-sans hover:text-red first:font-medium'>{link}</a>
                            </li>
                        ))}
                    </ul>

                    {/* Search bar */}
                    <div className="flex items-center">
                        <input type="text" placeholder="Search" className="bg-transparent outline-double outline-fuchsia-900 px-3 py-1 rounded-3xl mr-4" />
                    </div>

                    {/* Auth Buttons */}
                    <div className='space-x-4 hidden lg:flex items-center'>
                        <button onClick={() => toggleAuth('login')} className='text-white py-2 px-4 transition-all duration-300 rounded-2xl  w-24 h-10 hover:bg-grey font-sans'>Login</button>
                        <button onClick={() => toggleAuth('signup')} className='text-white py-2 px-4 transition-all duration-300 rounded-2xl  w-24 h-10 hover:bg-grey font-sans'>Signup</button>
                    </div>

                    <div className='space-x-4 hidden lg:flex items-center'>
                        <a href={Connect.Path}>
                            <button className='bg-fuchsia-600 text-white py-2 px-4 transition-all duration-300 rounded-2xl  w-24 h-10 hover:bg-grey font-sans'>{Connect.link}</button>
                        </a>
                    </div>

                    <div className='md:hidden'>
                        <button
                            onClick={toggleisMenu}
                            className='text-GreyD focus:outline-none focus:text-red'>
                            {isMenuOpen ? <Img src={menu} alt="Menu Icon" className='h-6 w-6' /> : null}
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`space-y-4 px-4 mt-16 py-7 bg-red ${isMenuOpen ? "block fixed top-0 right-0 left-0" : "hidden"}`}>
                {NavItems.map(({ link, Path }) => (
                    <li key={Path}>
                        <a href={Path} className='block text-base text-white font-sans hover:text-red first:font-medium'>{link}</a>
                    </li>
                ))}
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
                            background: '#fff',
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
        </header>
    );
};

export default NavBar;