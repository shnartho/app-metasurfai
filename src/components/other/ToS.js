import React from 'react';

const ToS = () => {
    return (
        <div className='px-6 md:px-12 lg:px-24 py-8 max-w-6xl mx-auto text-gray-800 dark:text-gray-200'>
            <h1 className='font-bold text-4xl mb-6 text-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent'>
                Terms of Service for MetaSurfAI
            </h1>
            <p className='text-center text-gray-600 dark:text-gray-400 mb-8'>Last Updated: August 28, 2025</p>

            <div className='bg-blue-50 dark:bg-blue-900 p-6 rounded-lg mb-8'>
                <p className='text-lg leading-relaxed'>
                    These Terms of Service ("Terms") govern your use of MetaSurfAI ("we," "us," or "our"), the world's first 
                    AI-powered decentralized reward-based advertising platform. Our Services provide revolutionary digital advertising 
                    solutions with integrated cryptocurrency transactions, cross-platform delivery, blockchain-based analytics, 
                    and token economy rewards ("Services").
                </p>
                <p className='mt-4 font-semibold'>
                    By accessing or using our Services, you agree to these Terms. Please read them carefully.
                </p>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>1. Acceptance of Terms</h2>
            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg mb-6 shadow-md'>
                <p className='mb-4'>
                    By accessing or using MetaSurfAI, you agree to be bound by these Terms, our Privacy Policy, and any additional 
                    terms for specific features. If you do not agree to any part of these Terms, you must not use the Services.
                </p>
                <p>
                    Your continued use of our platform constitutes acceptance of any updates to these Terms.
                </p>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>2. Eligibility & Account Requirements</h2>
            <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 p-6 rounded-lg'>
                    <h3 className='text-xl font-bold mb-4'>Age & Legal Capacity</h3>
                    <ul className='space-y-2'>
                        <li>• Must be at least 18 years old or legal age in your jurisdiction</li>
                        <li>• Legal capacity to enter binding agreements</li>
                        <li>• Compliance with local laws regarding cryptocurrency</li>
                        <li>• Ability to understand token economy implications</li>
                    </ul>
                </div>
                <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg'>
                    <h3 className='text-xl font-bold mb-4'>Account Responsibilities</h3>
                    <ul className='space-y-2'>
                        <li>• Provide accurate and current information</li>
                        <li>• Maintain confidentiality of account credentials</li>
                        <li>• Responsible for all activities under your account</li>
                        <li>• Secure wallet and private key management</li>
                    </ul>
                </div>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>3. Platform Services & Features</h2>
            
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6'>
                <h3 className='text-xl font-bold mb-4'>MetaSurfAI offers revolutionary advertising capabilities:</h3>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Cross-Platform Delivery</h4>
                        <p className='text-sm'>One-click campaigns across YouTube, Twitch, TikTok, websites, games, VR/AR, radio, and billboards</p>
                    </div>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Token Rewards</h4>
                        <p className='text-sm'>Users earn cryptocurrency for genuine ad engagement and interactions</p>
                    </div>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Live Ad Injection</h4>
                        <p className='text-sm'>Real-time sponsored moments during live streams and broadcasts</p>
                    </div>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Notification Ads</h4>
                        <p className='text-sm'>Mobile, WhatsApp, Telegram ads with user compensation</p>
                    </div>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Metaverse Integration</h4>
                        <p className='text-sm'>3D world advertising with NFT-based land and ad slot ownership</p>
                    </div>
                    <div className='bg-white dark:bg-gray-700 p-4 rounded-lg'>
                        <h4 className='font-bold mb-2'>Blockchain Verification</h4>
                        <p className='text-sm'>Transparent, audit-friendly engagement metrics and anti-fraud protection</p>
                    </div>
                </div>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>4. Prohibited Activities & Content</h2>
            
            <div className='bg-red-50 dark:bg-red-900 p-6 rounded-lg mb-6'>
                <h3 className='text-xl font-bold mb-4 text-red-700 dark:text-red-300'>You agree NOT to:</h3>
                <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                        <h4 className='font-bold mb-3'>Illegal & Harmful Content</h4>
                        <ul className='space-y-1 text-sm'>
                            <li>• Promote illegal activities, products, or services</li>
                            <li>• False, deceptive, or misleading advertising claims</li>
                            <li>• Fraudulent cryptocurrency schemes or unlicensed ICOs</li>
                            <li>• Adult content, hate speech, or violent material</li>
                            <li>• Intellectual property violations</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-bold mb-3'>Platform Abuse</h4>
                        <ul className='space-y-1 text-sm'>
                            <li>• Interfere with platform security or functionality</li>
                            <li>• Introduce malicious software or exploits</li>
                            <li>• Manipulate engagement metrics or rewards</li>
                            <li>• Create fake accounts or bot networks</li>
                            <li>• Circumvent anti-fraud measures</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>5. Cryptocurrency & Token Economy</h2>
            
            <div className='space-y-6'>
                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
                    <h3 className='text-xl font-bold mb-4'>Token Utility & Economics</h3>
                    <div className='grid md:grid-cols-2 gap-6'>
                        <div>
                            <h4 className='font-bold mb-2'>Native Token Features</h4>
                            <ul className='space-y-1'>
                                <li>• 1B maximum supply with liquidity pool trading</li>
                                <li>• Utility for rewards, ad spend, and ecosystem fees</li>
                                <li>• Earned tokens can fund your own advertising campaigns</li>
                                <li>• Users share in the value they create</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className='font-bold mb-2'>Payment Terms</h4>
                            <ul className='space-y-1'>
                                <li>• All cryptocurrency transactions are final</li>
                                <li>• Network fees (gas) are your responsibility</li>
                                <li>• No refunds unless required by law</li>
                                <li>• Price volatility risks are assumed by users</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className='bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg'>
                    <h3 className='text-xl font-bold mb-4'>Compliance & Tax Obligations</h3>
                    <p className='mb-4'>You are solely responsible for:</p>
                    <ul className='space-y-2 ml-6'>
                        <li>• Ensuring compliance with cryptocurrency regulations in your jurisdiction</li>
                        <li>• Reporting gains, losses, or applicable taxes under EU and local laws</li>
                        <li>• Understanding the tax implications of token rewards and trading</li>
                        <li>• Maintaining records of all transactions for regulatory purposes</li>
                    </ul>
                </div>
            </div>

            <h2 className='text-3xl font-bold mb-4 mt-8 text-pink-600 dark:text-pink-400'>6. Intellectual Property Rights</h2>
            
            <div className='bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 p-6 rounded-lg mb-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                        <h3 className='text-xl font-bold mb-4'>Our Intellectual Property</h3>
                        <p className='mb-4'>All MetaSurfAI content, technology, and data are our intellectual property, including:</p>
                        <ul className='space-y-1 text-sm'>
                            <li>• AI algorithms and machine learning models</li>
                            <li>• Cross-platform integration technology</li>
                            <li>• Blockchain analytics and smart contracts</li>
                            <li>• User interface and platform design</li>
                            <li>• Brand names, logos, and trademarks</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-xl font-bold mb-4'>Your Content Rights</h3>
                        <p className='mb-4'>When you submit advertising content:</p>
                        <ul className='space-y-1 text-sm'>
                            <li>• You retain ownership of your original content</li>
                            <li>• You grant us license to display and distribute</li>
                            <li>• You warrant you have necessary rights</li>
                            <li>• You're responsible for copyright compliance</li>
                            <li>• We may remove violating content</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h2 className='text-3xl font-bold mb-4 text-pink-600 dark:text-pink-400'>7. Contact Information</h2>
            
            <div className='bg-gradient-to-r from-pink-600 to-blue-600 text-white p-6 rounded-lg text-center'>
                <p className='mb-4 text-lg'>For questions, concerns, or support regarding these Terms:</p>
                <div className='space-y-2'>
                    <p><strong>Email:</strong> legal@metasurfai.com</p>
                    <p><strong>Support:</strong> support@metasurfai.com</p>
                    <p><strong>Business:</strong> business@metasurfai.com</p>
                    <p><strong>Address:</strong> [Company Address, Portugal]</p>
                </div>
                <p className='mt-6 text-sm opacity-90'>
                    We will respond to all inquiries within 48 hours during business days.
                </p>
            </div>
        </div>
    );
};

export default ToS;
