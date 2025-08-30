// Simple Balance Utility
// Provides basic balance consistency without over-engineering

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
            
            return true;
        } catch (error) {
            return false;
        }
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
            return cleaned;
        }
        return null;
    }
};
