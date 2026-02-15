import React from 'react';
import ComingSoonBox from '../utils/ui/ComingSoonBox';

const AIAdsCampaign = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Ads Campaign</h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                        Revolutionize your advertising with our intelligent AI-powered platform. Launch, manage, and optimize targeted ad campaigns across multiple platforms from a single unified dashboard.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Feature Image */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                            <img
                                src="/ai_ads_campaign.png"
                                alt="AI Ads Campaign Dashboard"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden items-center justify-center w-full h-full">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">AI Ads Campaign Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Description */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon</h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                <p className="text-lg leading-relaxed">
                                    Our AI Ads Campaign platform is designed to transform how businesses approach digital advertising. Powered by advanced artificial intelligence, this comprehensive solution provides:
                                </p>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Unified Dashboard</h3>
                                            <p className="text-sm">Manage all your ad campaigns from a single, intuitive interface with real-time analytics and performance insights.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Optimization</h3>
                                            <p className="text-sm">Our intelligent AI agents continuously analyze performance data to optimize targeting, bidding, and creative content across platforms.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Multi-Platform Targeting</h3>
                                            <p className="text-sm">Seamlessly launch and manage campaigns across Facebook, Google, Instagram, LinkedIn, Twitter, and emerging platforms.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Budget Management</h3>
                                            <p className="text-sm">AI-driven budget allocation ensures maximum ROI by automatically adjusting spend based on performance and market conditions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon Notice */}
                        <ComingSoonBox
                            title="AI Ads Campaign Platform"
                            description="We're building the future of advertising. Our AI-powered platform will revolutionize how you manage and optimize ad campaigns across all major platforms."
                            features={[
                                "Single dashboard for all platforms",
                                "AI agent-driven campaign optimization",
                                "Real-time performance analytics",
                                "Automated budget management",
                                "Cross-platform audience targeting"
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAdsCampaign;