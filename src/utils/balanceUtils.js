// Simple Balance Utility
// Provides basic balance consistency without over-engineering
import { apiCall } from './api';

export const balanceUtils = {
    // Get current user profile
    getUserProfile() {
        try {
            const stored = localStorage.getItem('userProfile');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    },

    // Get current balance (always use 'balance' field for consistency)
    getCurrentBalance() {
        const profile = this.getUserProfile();
        return profile?.balance || 0;
    },

    // Clean up profile by removing any localBalance field and ensuring consistency
    cleanupProfile(profile) {
        if (!profile) return profile;
        
        // Remove localBalance to prevent confusion, keep only 'balance'
        const cleaned = { ...profile };
        if (cleaned.localBalance !== undefined) {
            // If balance doesn't exist but localBalance does, migrate it
            if (cleaned.balance === undefined) {
                cleaned.balance = cleaned.localBalance;
            }
            delete cleaned.localBalance;
        }
        
        return cleaned;
    },

    // Update balance consistently (local only - backend is handled by specific APIs like watchedAd)
    updateBalance(newBalance, reason = '', delta = null) {
        try {
            let profile = this.getUserProfile();
            if (!profile) {
                return false;
            }

            // Clean up the profile first
            profile = this.cleanupProfile(profile);

            const oldBalance = profile.balance || 0;

            const updatedProfile = {
                ...profile,
                balance: parseFloat(newBalance) || 0
            };

            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            // Notify other components
            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: { profile: updatedProfile, previousBalance: oldBalance }
            }));

            // Note: Backend balance updates are now handled by specific APIs (like watchedAd)
            // No longer sending separate balance updates to avoid conflicts

            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Check if user has sufficient balance
    hasSufficientBalance(amount) {
        return this.getCurrentBalance() >= parseFloat(amount);
    },


    // Unified balance change: positive to add, negative to subtract
    applyBalanceChange(amount, reason = '') {
        const currentBalance = this.getCurrentBalance();
        const delta = parseFloat(amount);
        const newBalance = currentBalance + delta;
        if (newBalance < 0) {
            return false;
        }
        return this.updateBalance(newBalance, reason, delta);
    },

    // Add to balance (for rewards)
    addToBalance(amount, reason = '') {
        return this.applyBalanceChange(Math.abs(amount), reason);
    },

    // Subtract from balance (for ad costs)
    subtractFromBalance(amount, reason = '') {
        const currentBalance = this.getCurrentBalance();
        const delta = -parseFloat(amount);
        const newBalance = currentBalance + delta;
        
        if (newBalance < 0) {
            return false;
        }
        
        return this.updateBalance(newBalance, reason, delta);
    },

    // Force cleanup of current profile (call this if you suspect balance inconsistency)
    forceCleanup() {
        const profile = this.getUserProfile();
        if (profile) {
            const cleaned = this.cleanupProfile(profile);
            localStorage.setItem('userProfile', JSON.stringify(cleaned));
            
            // Don't send to backend during cleanup to avoid unwanted balance changes
            // Only clean up local storage
            
            return cleaned;
        }
        return null;
    },
    
    // Fetch latest balance from backend (useful for incognito mode)
    fetchBalanceFromBackend() {
        const token = localStorage.getItem('authToken');
        if (!token) return Promise.resolve(false);
        
        // Get profile from backend
        return apiCall('profile', {
            token,
            base: 'new'
        })
        .then(response => {
            if (response && response.balance !== undefined) {
                // Update localStorage with backend balance
                const profile = this.getUserProfile();
                if (profile) {
                    const updatedProfile = {
                        ...profile,
                        balance: parseFloat(response.balance) || 0,
                        watched_ads: response.watched_ads || profile.watched_ads || []
                    };
                    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                    
                    // Notify other components
                    window.dispatchEvent(new CustomEvent('profileUpdated', {
                        detail: { profile: updatedProfile }
                    }));
                }
                return true;
            }
            return false;
        })
        .catch(error => {
            console.warn('[BalanceUtils] Error fetching backend balance:', error);
            return false;
        });
    },

    // New function: Handle watched ad - calls API and updates local profile
    async handleWatchedAd(adId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('[BalanceUtils] No auth token for watched ad');
            return false;
        }

        try {
            // Call the new watched ads API
            const response = await apiCall('watchedAd', {
                body: { id: adId },
                token,
                base: 'new'
            });

            // If the API returns updated profile data, use it
            if (response && response.balance !== undefined) {
                const updatedProfile = {
                    ...this.getUserProfile(),
                    balance: parseFloat(response.balance) || 0,
                    watched_ads: response.watched_ads || []
                };
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                window.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { profile: updatedProfile }
                }));
                if (typeof window !== 'undefined' && window.apiCache) {
                    window.apiCache.set('profile', updatedProfile);
                }
                return true;
            } else if (response && response.message && response.message.startsWith('Success')) {
                // If only a success message, refetch profile from backend
                await this.fetchBalanceFromBackend();
                return true;
            } else {
                console.warn('[BalanceUtils] Watched ad API did not return profile data');
                return false;
            }
        } catch (error) {
            console.error('[BalanceUtils] Error calling watched ad API:', error);
            return false;
        }
    },

    // Check if user has already watched a specific ad
    hasWatchedAd(adId) {
        const profile = this.getUserProfile();
        const watchedAds = profile?.watched_ads || [];
        return watchedAds.includes(adId);
    },

    // Filter ads to exclude already watched ones
    filterUnwatchedAds(ads) {
        const profile = this.getUserProfile();
        const watchedAds = profile?.watched_ads || [];
        return ads.filter(ad => !watchedAds.includes(ad.id));
    }
};
