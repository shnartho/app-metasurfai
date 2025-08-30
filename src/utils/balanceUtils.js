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

    // Update balance consistently
    updateBalance(newBalance, reason = '') {
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
            
            // Also update balance on backend for incognito support
            this.updateBackendBalance(parseFloat(newBalance) || 0);
            
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Simple function to update balance on backend
    updateBackendBalance(balance) {
        const token = localStorage.getItem('authToken');
        if (!token) return false;
        
        // Fire and forget - don't wait for response
        apiCall('updateBalance', {
            body: { amount: balance },
            token,
            base: 'new'
        }).catch(err => {
            console.warn('[BalanceUtils] Backend update failed:', err);
        });
        
        return true;
    },

    // Check if user has sufficient balance
    hasSufficientBalance(amount) {
        return this.getCurrentBalance() >= parseFloat(amount);
    },

    // Add to balance (for rewards)
    addToBalance(amount, reason = '') {
        const currentBalance = this.getCurrentBalance();
        const newBalance = currentBalance + parseFloat(amount);
        return this.updateBalance(newBalance, reason);
    },

    // Subtract from balance (for ad costs)
    subtractFromBalance(amount, reason = '') {
        const currentBalance = this.getCurrentBalance();
        const newBalance = currentBalance - parseFloat(amount);
        
        if (newBalance < 0) {
            return false;
        }
        
        return this.updateBalance(newBalance, reason);
    },

    // Force cleanup of current profile (call this if you suspect balance inconsistency)
    forceCleanup() {
        const profile = this.getUserProfile();
        if (profile) {
            const cleaned = this.cleanupProfile(profile);
            localStorage.setItem('userProfile', JSON.stringify(cleaned));
            
            // Also sync with backend to help with incognito mode
            if (cleaned.balance !== undefined) {
                this.updateBackendBalance(cleaned.balance);
            }
            
            return cleaned;
        }
        return null;
    },
    
    // Fetch latest balance from backend (useful for incognito mode)
    fetchBalanceFromBackend() {
        const token = localStorage.getItem('authToken');
        if (!token) return Promise.resolve(false);
        
        // Get profile from backend
        return apiCall('getProfile', {
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
                        balance: parseFloat(response.balance) || 0
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
    }
};
