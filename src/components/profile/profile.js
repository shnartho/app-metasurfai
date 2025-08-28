import React, { useState, useEffect } from 'react';
import { useProfileData, useWatchedAds } from '../../utils/profileHooks';
import { cacheUtils } from '../../utils/apiCache';

function Profile() {
    // Use optimized hooks for profile and watched ads data
    const { 
        profileData, 
        loading, 
        error, 
        refreshProfile, 
        updateProfile,
        getBalance,
        getEmail,
        getName,
        isAuthenticated
    } = useProfileData();
    
    const { 
        watchedAds, 
        watchedCount,
        isAdWatched,
        addWatchedAd 
    } = useWatchedAds();

    const [editMode, setEditMode] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});

    // Initialize edited profile when profile data loads
    useEffect(() => {
        if (profileData) {
            setEditedProfile({
                name: getName(),
                email: getEmail(),
                region: profileData.region || '',
                // Add other editable fields as needed
            });
        }
    }, [profileData, getName, getEmail]);

    // Periodic refresh of profile data (less frequent with caching)
    useEffect(() => {
        if (isAuthenticated()) {
            // Refresh profile every 5 minutes (cache will handle the actual frequency)
            const interval = setInterval(() => {
                refreshProfile(false); // Use cache if valid
            }, 5 * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, refreshProfile]);

    const handleSaveProfile = async () => {
        try {
            const success = await updateProfile(editedProfile);
            if (success) {
                setEditMode(false);
                // Force refresh to get latest data from server
                await refreshProfile(true);
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error updating profile. Please check your connection and try again.');
        }
    };

    const handleCancelEdit = () => {
        // Reset to original data
        setEditedProfile({
            name: getName(),
            email: getEmail(),
            region: profileData?.region || '',
        });
        setEditMode(false);
    };

    const handleResetDemoData = () => {
        // Clear cached profile and watched ads data
        cacheUtils.clearUserCache();
        
        // Also clear localStorage for backward compatibility
        localStorage.removeItem('userProfile');
        localStorage.removeItem('watchedAds');
        
        // Force refresh
        refreshProfile(true);
        
        alert('Demo data reset! Your profile and watched ads have been cleared.');
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading profile: {error.message}</p>
                    <button 
                        onClick={() => refreshProfile(true)}
                        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-xl text-gray-600 dark:text-gray-300 mb-4">Please Log In</div>
                    <p className="text-sm text-gray-500">You need to log in to view your profile.</p>
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
                            {getEmail() || 'N/A'}
                        </div>
                    </div>

                    {/* Local Balance Display */}
                    <div className="profile-item">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Local Balance
                        </label>
                        <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-3 rounded-lg text-center font-bold text-lg">
                            ${getBalance()?.toFixed(2) || '0.00'}
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
                            <span className="text-2xl font-bold text-pink-600 dark:text-blue-400">{watchedCount}</span>
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
                        onClick={handleResetDemoData}
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