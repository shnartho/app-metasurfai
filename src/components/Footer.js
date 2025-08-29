import React from 'react';
import { Img } from 'react-image';
import logo from '../../public/Logo.png';
import DiscordIcon from '../../public/discord.svg';
import TwitterIcon from '../../public/twitter.svg';
import GithubIcon from '../../public/github.svg';
import LinkedinIcon from '../../public/linkedin.svg';
import { useNavigate} from "react-router-dom";

const Footer = ({ DarkMode, isOpen }) => {

    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
            <footer className="w-full mt-auto px-4 py-2">
                <div className="flex flex-col space-y-4">
                    <div className="space-y-4 text-xs">
                        <div>
                            <h2 className="text-black dark:text-white font-semibold mb-1">About</h2>
                            <ul className="space-y-1">
                                <li>
                                    <a onClick={() => navigate('about')} 
                                       className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-blue-600 cursor-pointer">
                                       About Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-black dark:text-white font-semibold mb-1">Legal</h2>
                            <ul className="space-y-1">
                                <li>
                                    <a onClick={() => navigate('privacy')} 
                                       className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-blue-600 cursor-pointer">
                                       Privacy
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => navigate('tos')} 
                                       className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-blue-600 cursor-pointer">
                                       Terms
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-1">
                    <h2 className="text-black dark:text-white font-semibold mb-1 text-xs">Follow Us</h2>
                    <div className=" icon-dark-mode grid grid-cols-2">
                        <a href='/'><DiscordIcon className={`w-6 h-6 ${
                            DarkMode ? 'text-gray-400 hover:text-blue-600' : 'text-black hover:text-pink-600'
                        }`} /> </a>
                        <a href='/'><TwitterIcon className={`w-6 h-6 ${
                            DarkMode ? 'text-gray-400 hover:text-blue-600' : 'text-black hover:text-pink-600'
                        }`} /></a>
                        <a href='https://github.com/shnartho/app-metasurfai'><GithubIcon className={`w-6 h-6 ${
                            DarkMode ? 'text-gray-400 hover:text-blue-600' : 'text-black hover:text-pink-600'
                        }`} /></a>
                        <a href='https://www.linkedin.com/company/metasurfai'><LinkedinIcon className={`w-6 h-6 ${
                            DarkMode ? 'text-gray-400 hover:text-blue-600' : 'text-black hover:text-pink-600'
                        }`} /></a>
                    </div>
                    </div>
                </div>
            </footer>
    );
};

export default Footer;