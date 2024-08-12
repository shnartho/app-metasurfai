import { useState, useEffect } from 'react';
import React from 'react';
import ReactModal from 'react-modal';
import menu from "../../public/icon-menu.png";
import logo from "../../public/Logo.png";
import LoginForm from './Login/Login';
import SignUpForm from './Signup/SignUp';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeForm, setActiveForm] = useState(null);
    const [profileImage, setProfileImage] = useState(logo); // Default to local logo

    // useEffect(() => {
    //     fetch('https://metasurfai-public-api.fly.dev/v1/profile?username=nayem')
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data && data.profileImage) {
    //                 setProfileImage(data.profileImage);
    //             }
    //         })
    //         .catch(error => console.error('Error fetching profile image:', error));
    // }, []);

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

    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-xl flex items-center space-x-3">
                    <img src={logo} alt="MetaSurf Logo" width={40} height={40} className='rounded-full'/>
                    <span className='text-white font-Oxanium text-2xl font-bold pt-2'>MetaSurfAi</span>
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
                        <a onClick={() => navigateTo('./profile/profile')} className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavBar;