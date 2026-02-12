// Profile data hook with intelligent caching and sync
import { useState, useEffect, useCallback } from 'react';
import { cachedApiCall, cacheUtils } from './apiCache';

export const useProfileData = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load profile from localStorage or cache on mount
    useEffect(() => {
        const loadProfileData = () => {
            try {
                const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                    setProfileData(profile);
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('[useProfileData] Error loading profile from localStorage:', error);
                setError(error);
                setLoading(false);
            }
        };

        loadProfileData();

        // Listen for storage changes (multi-tab sync)
        const handleStorageChange = (e) => {
            if (e.key === 'userProfile' && e.newValue) {
                try {
                    const newProfile = JSON.parse(e.newValue);
                    setProfileData(newProfile);
                } catch (error) {
                    console.error('[useProfileData] Error parsing profile from storage event:', error);
                }
            }
        };

        // Listen for custom profile update events
        const handleProfileUpdate = () => {
            loadProfileData();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Refresh profile from API with caching
    const refreshProfile = useCallback(async (forceRefresh = false) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            
            const freshProfile = await cachedApiCall('profile', {
                token,
                base: process.env.NEXT_PUBLIC_USE_NEW_API === 'true' ? 'new' : 'old'
            }, forceRefresh);

            if (freshProfile) {
                setProfileData(freshProfile);
                localStorage.setItem('userProfile', JSON.stringify(freshProfile));
                
                // Dispatch update event for other components
                window.dispatchEvent(new Event('profileUpdated'));
                
                return freshProfile;
            }
        } catch (error) {
            console.error('[useProfileData] Error refreshing profile:', error);
            setError(error);
            
            // Fall back to cached/localStorage data if API fails
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile && !profileData) {
                try {
                    const fallbackProfile = JSON.parse(storedProfile);
                    setProfileData(fallbackProfile);
                } catch (parseError) {
                    console.error('[useProfileData] Error parsing fallback profile:', parseError);
                }
            }
        } finally {
            setLoading(false);
        }

        return null;
    }, [profileData]);

    // Update profile locally and sync with server
    const updateProfile = useCallback(async (updates) => {
        if (!profileData) {
            console.warn('[useProfileData] No profile data to update');
            return false;
        }

        try {
            const updatedProfile = { ...profileData, ...updates };
            
            // Update local state immediately for responsive UI
            setProfileData(updatedProfile);
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            
            // Invalidate cache to ensure fresh data on next fetch
            cacheUtils.invalidateProfile();
            
            // Dispatch update event
            window.dispatchEvent(new Event('profileUpdated'));
            
            // Sync with backend (new API only)
            const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
            if (isNewApi) {
                const token = localStorage.getItem('authToken');
                const accessToken = localStorage.getItem('accessToken');
                if (token && accessToken) {
                    const { apiCall } = await import('./api');
                    await apiCall('updateProfile', {
                        body: {
                            accessToken,
                            address: updates.address || undefined,
                            phone: updates.phone || undefined
                        },
                        token,
                        base: 'new'
                    });
                }
            }
            
            return true;
        } catch (error) {
            console.error('[useProfileData] Error updating profile:', error);
            setError(error);
            return false;
        }
    }, [profileData]);

    // Get current user ID for cache management
    const getUserId = useCallback(() => {
        return profileData?.id || profileData?.user_id || null;
    }, [profileData]);

    // Check if user is authenticated
    const isAuthenticated = useCallback(() => {
        return !!(localStorage.getItem('authToken') && profileData);
    }, [profileData]);

    return {
        profileData,
        loading,
        error,
        refreshProfile,
        updateProfile,
        getUserId,
        isAuthenticated,
        // Utility functions
        getBalance: () => profileData?.balance || 0,
        getEmail: () => profileData?.email || '',
        getName: () => profileData?.name || profileData?.username || '',
        getWatchedAds: () => profileData?.watched_ads || [],
        hasWatchedAd: (adId) => (profileData?.watched_ads || []).includes(adId),
        filterUnwatchedAds: (ads) => {
            const watchedAds = profileData?.watched_ads || [];
            return ads.filter(ad => !watchedAds.includes(ad.id));
        }
    };
};

// Hook for managing watched ads with user isolation
// NOTE: This is now legacy - use useProfileData().getWatchedAds() instead
// The watched_ads array is now managed by the profile from the API
export const useWatchedAds = () => {
    const { profileData, getUserId } = useProfileData();
    const [localWatchedAds, setLocalWatchedAds] = useState(new Set());

    useEffect(() => {
        // Sync with profile data if available
        if (profileData?.watched_ads) {
            setLocalWatchedAds(new Set(profileData.watched_ads));
        } else {
            // Fallback to localStorage for backward compatibility
            const loadWatchedAds = () => {
                try {
                    const userId = getUserId();
                    const key = userId ? `watchedAds_${userId}` : 'watchedAds';
                    const stored = localStorage.getItem(key);
                    
                    if (stored) {
                        const adsArray = JSON.parse(stored);
                        setLocalWatchedAds(new Set(adsArray));
                    }
                } catch (error) {
                    console.error('[useWatchedAds] Error loading watched ads:', error);
                }
            };
            loadWatchedAds();
        }
    }, [profileData?.watched_ads, getUserId]);

    const addWatchedAd = useCallback((adId) => {
        // This is now handled by the API - this function is for backward compatibility
        console.warn('[useWatchedAds] addWatchedAd is deprecated - use balanceUtils.handleWatchedAd() instead');
        
        setLocalWatchedAds(prev => {
            const newSet = new Set(prev);
            newSet.add(adId);
            return newSet;
        });
    }, []);

    const isAdWatched = useCallback((adId) => {
        // Check profile data first, then local state
        if (profileData?.watched_ads) {
            return profileData.watched_ads.includes(adId);
        }
        return localWatchedAds.has(adId);
    }, [profileData?.watched_ads, localWatchedAds]);

    const clearWatchedAds = useCallback(() => {
        setLocalWatchedAds(new Set());
        try {
            const userId = getUserId();
            const key = userId ? `watchedAds_${userId}` : 'watchedAds';
            localStorage.removeItem(key);
            localStorage.removeItem('watchedAds'); // Also clear legacy key
            
        } catch (error) {
            console.error('[useWatchedAds] Error clearing watched ads:', error);
        }
    }, [getUserId]);

    return {
        watchedAds: profileData?.watched_ads ? new Set(profileData.watched_ads) : localWatchedAds,
        addWatchedAd,
        isAdWatched,
        clearWatchedAds,
        watchedCount: (profileData?.watched_ads ? profileData.watched_ads.length : localWatchedAds.size)
    };
};
