import React from 'react';

const About = () => {
    return (
        <div className='about-container px-6 md:px-12 lg:px-24 py-8 max-w-6xl mx-auto'>
            <h1 className='about-heading font-bold text-4xl md:text-5xl text-center mb-8 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent'>
                AI Powered Decentralized Reward-Based Ads Platform
            </h1>
            
            <p className='text-lg md:text-xl text-center mb-12 text-gray-700 dark:text-gray-300 font-medium'>
                The World's First Advertisement Platform Delivering Instant Customer Reach, 
                Exceptional Interaction, and Advertising Like Never Before.
            </p>

            <div className='grid md:grid-cols-2 gap-8 mb-12'>
                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg'>
                    <h2 className='about-subheading font-bold text-2xl mb-4 text-pink-600 dark:text-pink-400'>
                        What's Broken in Modern Advertising?
                    </h2>
                    <div className='space-y-4'>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>Transparency Issues</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Authenticity of clicks, impressions, and viewership data is difficult to verify, 
                                fueling fraud and reducing trust in advertising metrics.
                            </p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>Ad Fatigue</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Users are overwhelmed with irrelevant and intrusive ads, causing frustration 
                                and diminished brand impact.
                            </p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>No User Incentives</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Audiences receive no meaningful rewards for their attention, 
                                discouraging active participation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg'>
                    <h2 className='about-subheading font-bold text-2xl mb-4 text-blue-600 dark:text-blue-400'>
                        MetaSurfAI's Revolutionary Solution
                    </h2>
                    <div className='space-y-4'>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>Token-Based Rewards</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Viewers earn cryptocurrency tokens for watching and interacting with ads, 
                                creating genuine engagement instead of avoidance.
                            </p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>Cross-Platform Unity</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                One-click delivery across YouTube, Twitch, TikTok, websites, games, 
                                VR/AR, radio, and billboards from a single dashboard.
                            </p>
                        </div>
                        <div>
                            <h4 className='font-semibold text-lg mb-2'>Blockchain Transparency</h4>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Blockchain-verified events and anti-fraud checks make results 
                                audit-friendly and trustworthy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mb-12'>
                <h2 className='about-subheading font-bold text-3xl mb-6 text-center'>
                    Revolutionary Features
                </h2>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='feature-card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>Live Ad Injection</h3>
                        <p className='text-sm'>Place sponsored moments in real-time during live streams and broadcasts.</p>
                    </div>
                    <div className='feature-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>Notification Ads</h3>
                        <p className='text-sm'>Mobile, WhatsApp, Telegram ads where users get paid per impression or click.</p>
                    </div>
                    <div className='feature-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>Always-On Radio</h3>
                        <p className='text-sm'>Users get paid per minute for listening; advertisers buy guaranteed listening time.</p>
                    </div>
                    <div className='feature-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>3D Games + XR/VR/AR</h3>
                        <p className='text-sm'>Immersive placements with built-in rewards so players actually interact.</p>
                    </div>
                    <div className='feature-card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>Live Digital Billboards</h3>
                        <p className='text-sm'>Rent Times Square-style billboards remotely and swap creatives in real-time.</p>
                    </div>
                    <div className='feature-card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 p-6 rounded-lg'>
                        <h3 className='font-bold text-lg mb-3'>Direct-to-Purchase</h3>
                        <p className='text-sm'>One tap to buy or jump straight to seller's checkout from the ad.</p>
                    </div>
                </div>
            </div>

            <div className='mb-12'>
                <h2 className='about-subheading font-bold text-3xl mb-6 text-center'>
                    Market Opportunity
                </h2>
                <div className='bg-gray-50 dark:bg-gray-800 p-8 rounded-lg'>
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center'>
                        <div>
                            <h3 className='font-bold text-2xl text-pink-600 dark:text-pink-400'>$1T+</h3>
                            <p className='text-sm'>Global ad market by 2030</p>
                        </div>
                        <div>
                            <h3 className='font-bold text-2xl text-blue-600 dark:text-blue-400'>25%</h3>
                            <p className='text-sm'>Annual growth in reward-based platforms</p>
                        </div>
                        <div>
                            <h3 className='font-bold text-2xl text-green-600 dark:text-green-400'>Multi-Channel</h3>
                            <p className='text-sm'>VR, billboards, notifications, radio</p>
                        </div>
                        <div>
                            <h3 className='font-bold text-2xl text-purple-600 dark:text-purple-400'>Real-Time</h3>
                            <p className='text-sm'>Interactive advertising demand</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mb-12'>
                <h2 className='about-subheading font-bold text-3xl mb-6 text-center'>
                    Token Economy & Ecosystem
                </h2>
                <div className='grid md:grid-cols-2 gap-8'>
                    <div className='space-y-4'>
                        <h3 className='font-bold text-xl mb-4'>Native Token Utility</h3>
                        <ul className='space-y-2'>
                            <li className='flex items-start'>
                                <span className='text-pink-600 dark:text-pink-400 mr-2'>•</span>
                                <span>1B max supply token tradable via liquidity pools</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-pink-600 dark:text-pink-400 mr-2'>•</span>
                                <span>Utility for rewards, ad spend, and ecosystem fees</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-pink-600 dark:text-pink-400 mr-2'>•</span>
                                <span>Earned tokens can be reused to post your own ads</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-pink-600 dark:text-pink-400 mr-2'>•</span>
                                <span>Users share in the value they create</span>
                            </li>
                        </ul>
                    </div>
                    <div className='space-y-4'>
                        <h3 className='font-bold text-xl mb-4'>Metaverse Integration</h3>
                        <ul className='space-y-2'>
                            <li className='flex items-start'>
                                <span className='text-blue-600 dark:text-blue-400 mr-2'>•</span>
                                <span>3D Metaverse world with purchasable land for ads</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-blue-600 dark:text-blue-400 mr-2'>•</span>
                                <span>NFTs represent ad slots, land rights, premium placements</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-blue-600 dark:text-blue-400 mr-2'>•</span>
                                <span>Real-time controls: pause, boost, swap creatives</span>
                            </li>
                            <li className='flex items-start'>
                                <span className='text-blue-600 dark:text-blue-400 mr-2'>•</span>
                                <span>Accountless cross-publishing across platforms</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='text-center bg-gradient-to-r from-pink-600 to-blue-600 text-white p-8 rounded-lg'>
                <h2 className='font-bold text-2xl mb-4'>
                    Join the Future of Advertising
                </h2>
                <p className='text-lg mb-6'>
                    Where advertisers reach genuine audiences, users earn rewards for their attention, 
                    and blockchain technology ensures transparency and trust.
                </p>
                <p className='text-sm opacity-90'>
                    MetaSurfAI is transforming advertising through decentralization, creating a win-win 
                    ecosystem for advertisers, users, and creators alike.
                </p>
            </div>
        </div>
    );
};

export default About;