import React from 'react';
import { Img } from 'react-image';
import logo from '../../public/Logo.png';
import DiscordIcon from '../../public/discord.svg';
import TwitterIcon from '../../public/twitter.svg';
import GithubIcon from '../../public/github.svg';
import LinkedinIcon from '../../public/linkedin.svg';

const MetaFooter = () => {
    return (
        <footer className="bg-zinc-950 bg-opacity-85 w-full mt-auto">
            <div className="grid justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
                <div className="space-y-4 mb-8">
                    <a href="/" className="text-2xl font-semibold flex items-center space-x-3">
                        <Img src={logo} alt="MetaSurfAi Logo" width={32} height={32} className="object-scale-down h-8 w-8 inline-block rounded-full" />
                        <span className="text-white font-Oxanium text-2xl font-bold pt-2">MetaSurfAi</span>
                    </a>
                </div>
                <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-white">About</h2>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-white">MetaSurfAi</a>
                            </li>
                            <li>
                                <a href="#" className="text-white">Our Services</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-white">Follow us</h2>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-white">Github</a>
                            </li>
                            <li>
                                <a href="#" className="text-white">Discord</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-white">Legal</h2>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-white">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className="text-white">Terms & Conditions</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <hr className="border-t my-4 border-white" />
            <div className="w-11/12 sm:flex sm:items-center sm:justify-between">
            <p className="mb-1 text-sm text-white">
                © MetaSurfAi™ {new Date().getFullYear()}
            </p>
            <div className="mt-4 flex space-x-4 sm:mt-0 sm:justify-end sm:flex-1">
                <a href="#" className="text-white hover:text-gray-300">
                    <DiscordIcon className="fill-current text-white" />
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                    <LinkedinIcon className="fill-current text-white" />
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                    <TwitterIcon className="fill-current text-white" />
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                    <GithubIcon className="fill-current text-white" />
                </a>
            </div>
        </div>
    </footer>
    );
};

export default MetaFooter;


