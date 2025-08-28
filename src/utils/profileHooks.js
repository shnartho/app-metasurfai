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
                    console.log('[useProfileData] Loaded profile from localStorage');
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
                    console.log('[useProfileData] Profile updated from storage event');
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
            console.log('[useProfileData] No auth token, skipping profile refresh');
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log(`[useProfileData] Refreshing profile (force: ${forceRefresh})`);
            
            const freshProfile = await cachedApiCall('profile', {
                token,
                base: process.env.NEXT_PUBLIC_USE_NEW_API === 'true' ? 'new' : 'old'
            }, forceRefresh);

            if (freshProfile) {
                setProfileData(freshProfile);
                localStorage.setItem('userProfile', JSON.stringify(freshProfile));
                
                // Dispatch update event for other components
                window.dispatchEvent(new Event('profileUpdated'));
                
                console.log('[useProfileData] Profile refreshed successfully');
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
                    console.log('[useProfileData] Using fallback profile data');
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
            
            console.log('[useProfileData] Profile updated locally');
            
            // TODO: Add API call to sync with server if needed
            // const token = localStorage.getItem('authToken');
            // await apiCall('updateProfile', { body: updates, token });
            
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
        getBalance: () => profileData?.balance || profileData?.localBalance || 0,
        getEmail: () => profileData?.email || '',
        getName: () => profileData?.name || profileData?.username || '',
    };
};

// Hook for managing watched ads with user isolation
export const useWatchedAds = () => {
    const [watchedAds, setWatchedAds] = useState(new Set());
    const { getUserId } = useProfileData();

    useEffect(() => {
        const loadWatchedAds = () => {
            try {
                const userId = getUserId();
                const key = userId ? `watchedAds_${userId}` : 'watchedAds';
                const stored = localStorage.getItem(key);
                
                if (stored) {
                    const adsArray = JSON.parse(stored);
                    setWatchedAds(new Set(adsArray));
                    console.log(`[useWatchedAds] Loaded ${adsArray.length} watched ads for user ${userId || 'anonymous'}`);
                }
            } catch (error) {
                console.error('[useWatchedAds] Error loading watched ads:', error);
            }
        };

        loadWatchedAds();
    }, [getUserId]);

    const addWatchedAd = useCallback((adId) => {
        setWatchedAds(prev => {
            const newSet = new Set(prev);
            newSet.add(adId);
            
            try {
                const userId = getUserId();
                const key = userId ? `watchedAds_${userId}` : 'watchedAds';
                localStorage.setItem(key, JSON.stringify([...newSet]));
                
                // Also update legacy key for backward compatibility
                localStorage.setItem('watchedAds', JSON.stringify([...newSet]));
                
                console.log(`[useWatchedAds] Added watched ad ${adId} for user ${userId || 'anonymous'}`);
            } catch (error) {
                console.error('[useWatchedAds] Error saving watched ads:', error);
            }
            
            return newSet;
        });
    }, [getUserId]);

    const isAdWatched = useCallback((adId) => {
        return watchedAds.has(adId);
    }, [watchedAds]);

    const clearWatchedAds = useCallback(() => {
        setWatchedAds(new Set());
        try {
            const userId = getUserId();
            const key = userId ? `watchedAds_${userId}` : 'watchedAds';
            localStorage.removeItem(key);
            localStorage.removeItem('watchedAds'); // Also clear legacy key
            
            console.log(`[useWatchedAds] Cleared watched ads for user ${userId || 'anonymous'}`);
        } catch (error) {
            console.error('[useWatchedAds] Error clearing watched ads:', error);
        }
    }, [getUserId]);

    return {
        watchedAds,
        addWatchedAd,
        isAdWatched,
        clearWatchedAds,
        watchedCount: watchedAds.size
    };
};
