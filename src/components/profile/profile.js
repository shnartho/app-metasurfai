import React, { useEffect, useState } from 'react';

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [watchedAdsCount, setWatchedAdsCount] = useState(0);

    useEffect(() => {
        // Get profile data from localStorage
        const storedProfile = localStorage.getItem('userProfile');
        const watchedAds = localStorage.getItem('watchedAds');
        
        if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            setProfileData(profile);
        }
        
        if (watchedAds) {
            const watchedAdsArray = JSON.parse(watchedAds);
            setWatchedAdsCount(watchedAdsArray.length);
        }

        // Listen for storage changes to update balance in real-time
        const handleStorageChange = () => {
            const updatedProfile = localStorage.getItem('userProfile');
            const updatedWatchedAds = localStorage.getItem('watchedAds');
            
            if (updatedProfile) {
                setProfileData(JSON.parse(updatedProfile));
            }
            
            if (updatedWatchedAds) {
                const watchedAdsArray = JSON.parse(updatedWatchedAds);
                setWatchedAdsCount(watchedAdsArray.length);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for manual updates (same tab)
        const intervalId = setInterval(() => {
            const currentProfile = localStorage.getItem('userProfile');
            const currentWatchedAds = localStorage.getItem('watchedAds');
            
            if (currentProfile) {
                const profile = JSON.parse(currentProfile);
                setProfileData(prevProfile => {
                    if (!prevProfile || prevProfile.localBalance !== profile.localBalance) {
                        return profile;
                    }
                    return prevProfile;
                });
            }
            
            if (currentWatchedAds) {
                const watchedAdsArray = JSON.parse(currentWatchedAds);
                setWatchedAdsCount(watchedAdsArray.length);
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, []);

    if (!profileData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-xl text-gray-600 dark:text-gray-300 mb-4">Loading Profile...</div>
                    <p className="text-sm text-gray-500">Please make sure you are logged in</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                </div>

                <div className="space-y-4">
                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                            {profileData.email || 'N/A'}
                        </div>
                    </div>

                    {/* Local Balance Display */}
                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Local Balance
                        </label>
                        <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-3 rounded-lg text-center font-bold text-lg">
                            ${profileData.localBalance?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This is your local demo balance from watching ads
                        </p>
                    </div>

                    {/* Ads Watched Counter */}
                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ads Watched
                        </label>
                        <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md text-center">
                            <span className="text-2xl font-bold text-pink-600 dark:text-blue-400">{watchedAdsCount}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">ads completed</span>
                        </div>
                    </div>

                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Verification Status
                        </label>
                        <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                profileData.verified 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                                {profileData.verified ? 'Verified' : 'Not Verified'}
                            </span>
                        </div>
                    </div>

                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Member Since
                        </label>
                        <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                            {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Clear Balance Button (for demo purposes) */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={() => {
                            const updatedProfile = { ...profileData, localBalance: 0 };
                            setProfileData(updatedProfile);
                            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                            localStorage.removeItem('watchedAds');
                            setWatchedAdsCount(0);
                            alert('Balance and watched ads reset for demo purposes!');
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200"
                    >
                        Reset Demo Data
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        This resets your local balance and watched ads for demo purposes
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Profile;