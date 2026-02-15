// Enhanced API caching utility with multi-user support
// Reduces API calls by intelligently caching data with expiration and user isolation

class ApiCache {
    constructor() {
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
        this.cacheTTLs = {
            ads: 2 * 60 * 1000,        // 2 minutes for ads (dynamic content)
            profile: 10 * 60 * 1000,   // 10 minutes for profile data
            userAds: 3 * 60 * 1000,    // 3 minutes for user's own ads
            images: 60 * 60 * 1000,    // 1 hour for image lists
            settings: 30 * 60 * 1000   // 30 minutes for settings
        };
        
        // Track pending requests to prevent duplicate API calls
        this.pendingRequests = new Map();
    }

    // Get current user ID for multi-user caching
    getCurrentUserId() {
        try {
            const profile = localStorage.getItem('userProfile');
            if (profile) {
                const parsed = JSON.parse(profile);
                return parsed.id || parsed.user_id || 'anonymous';
            }
        } catch (e) {}
        return 'anonymous';
    }

    // Generate cache key with user isolation
    getCacheKey(key, userId = null) {
        const user = userId || this.getCurrentUserId();
        return `cache_${user}_${key}`;
    }

    // Set data in cache with expiration
    set(key, data, ttl = null) {
        try {
            const userId = this.getCurrentUserId();
            const cacheKey = this.getCacheKey(key, userId);
            const expireTime = Date.now() + (ttl || this.cacheTTLs[key] || this.defaultTTL);
            
            const cacheData = {
                data,
                expires: expireTime,
                userId,
                timestamp: Date.now()
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            
            // Also update the legacy localStorage key for backward compatibility
            if (key === 'ads') {
                localStorage.setItem('Ads', JSON.stringify(data));
            } else if (key === 'profile') {
                localStorage.setItem('userProfile', JSON.stringify(data));
            }
            
        } catch (e) {
            console.warn('[ApiCache] Failed to cache data:', e);
        }
    }

    // Get data from cache if valid
    get(key, userId = null) {
        try {
            const cacheKey = this.getCacheKey(key, userId);
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) {
                return null;
            }
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is expired
            if (now > cacheData.expires) {
                this.remove(key, userId);
                return null;
            }
            
            // Check if cache is for current user
            const currentUser = userId || this.getCurrentUserId();
            if (cacheData.userId !== currentUser) {
                return null;
            }
            
            return cacheData.data;
        } catch (e) {
            console.warn('[ApiCache] Failed to get cached data:', e);
            return null;
        }
    }

    // Remove specific cache entry
    remove(key, userId = null) {
        try {
            const cacheKey = this.getCacheKey(key, userId);
            localStorage.removeItem(cacheKey);
        } catch (e) {
            console.warn('[ApiCache] Failed to remove cache:', e);
        }
    }

    // Clear all cache for current user
    clearUserCache(userId = null) {
        try {
            const user = userId || this.getCurrentUserId();
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`cache_${user}_`)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('[ApiCache] Failed to clear user cache:', e);
        }
    }

    // Clear all expired cache entries (cleanup)
    clearExpired() {
        try {
            const now = Date.now();
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    try {
                        const cached = localStorage.getItem(key);
                        const cacheData = JSON.parse(cached);
                        if (now > cacheData.expires) {
                            keysToRemove.push(key);
                        }
                    } catch (e) {
                        // Invalid cache entry, remove it
                        keysToRemove.push(key);
                    }
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('[ApiCache] Failed to clear expired cache:', e);
        }
    }

    // Check if cache exists and is valid
    isValid(key, userId = null) {
        const cached = this.get(key, userId);
        return cached !== null;
    }

    // Get cache statistics
    getStats() {
        const stats = {
            totalEntries: 0,
            userEntries: 0,
            expiredEntries: 0,
            currentUser: this.getCurrentUserId()
        };

        try {
            const now = Date.now();
            const currentUser = this.getCurrentUserId();

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    stats.totalEntries++;
                    
                    if (key.startsWith(`cache_${currentUser}_`)) {
                        stats.userEntries++;
                    }

                    try {
                        const cached = localStorage.getItem(key);
                        const cacheData = JSON.parse(cached);
                        if (now > cacheData.expires) {
                            stats.expiredEntries++;
                        }
                    } catch (e) {
                        stats.expiredEntries++;
                    }
                }
            }
        } catch (e) {
            console.warn('[ApiCache] Failed to get stats:', e);
        }

        return stats;
    }

    // Pending request management to prevent duplicate API calls
    getPendingKey(action, options) {
        const userId = this.getCurrentUserId();
        const optionsStr = JSON.stringify(options || {});
        return `${userId}_${action}_${optionsStr}`;
    }

    // Check if request is already pending
    isPending(action, options) {
        const key = this.getPendingKey(action, options);
        return this.pendingRequests.has(key);
    }

    // Set a request as pending and return the promise
    setPending(action, options, promise) {
        const key = this.getPendingKey(action, options);
        this.pendingRequests.set(key, promise);
        
        // Clean up when promise resolves/rejects
        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
        
        return promise;
    }

    // Get existing pending request
    getPending(action, options) {
        const key = this.getPendingKey(action, options);
        return this.pendingRequests.get(key);
    }
}

// Create global cache instance
export const apiCache = new ApiCache();

// Enhanced API call wrapper with intelligent caching and duplicate prevention
export const cachedApiCall = async (action, options = {}, forceRefresh = false) => {
    const { body = {}, token = '', headers = {}, base, cacheKey = action, skipCache = false } = options;
    
    // Don't cache write operations or sensitive data
    // TODO: updateAd temporarily removed from non-cacheable list - can be reactivated later
    const nonCacheableActions = ['login', 'signup', 'createAd', /*'updateAd',*/ 'deleteAd', 'uploadImage', 'watchedAd'];
    const shouldCache = !skipCache && !nonCacheableActions.includes(action);
    
    // For read operations, try cache first
    if (shouldCache && !forceRefresh) {
        const cached = apiCache.get(cacheKey);
        if (cached !== null) {
            return cached;
        }
    }
    
    // Check if the same request is already pending to prevent duplicates
    if (shouldCache && !forceRefresh) {
        const pendingRequest = apiCache.getPending(action, { body, token, base });
        if (pendingRequest) {
            return await pendingRequest;
        }
    }
    
    // Import apiCall to avoid circular dependency
    const { apiCall } = await import('./api');
    
    // Create the API call promise
    const apiCallPromise = (async () => {
        try {
            const result = await apiCall(action, { body, token, headers, base });
            
            // Cache successful read operations
            if (shouldCache && result) {
                // Special handling for different data types
                if (action === 'ads') {
                    apiCache.set('ads', result);
                } else if (action === 'profile') {
                    apiCache.set('profile', result);
                } else {
                    apiCache.set(cacheKey, result);
                }
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    })();
    
    // Register as pending request if cacheable
    if (shouldCache) {
        apiCache.setPending(action, { body, token, base }, apiCallPromise);
    }
    
    return await apiCallPromise;
};

// Utility functions for common patterns
export const cacheUtils = {
    // Invalidate cache when user creates/updates/deletes content
    invalidateUserContent() {
        apiCache.remove('ads');
        apiCache.remove('userAds');
    },

    // Invalidate profile cache when balance or profile updates
    invalidateProfile() {
        apiCache.remove('profile');
    },

    // Invalidate specific cache key (for backward compatibility)
    invalidateKey(key) {
        apiCache.remove(key);
    },

    // Clear all cache when user logs out
    clearAllOnLogout() {
        apiCache.clearUserCache();
        localStorage.removeItem('Ads');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('watchedAds');
    },

    // Clear cache from previous user sessions (but keep current user's fresh data)
    clearPreviousUserCache() {
        const currentUserId = apiCache.getCurrentUserId();
        
        // Clear all cache entries except for the current user
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_') && !key.startsWith(`cache_${currentUserId}_`)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Also clear old-style cache entries that might be from previous sessions
            localStorage.removeItem('Ads'); // Legacy cache
            localStorage.removeItem('watchedAds'); // Will be rebuilt for new user
            
        } catch (e) {
        }
    },

    // Periodic cleanup (call this occasionally)
    performCleanup() {
        apiCache.clearExpired();
    },

    // Get cache statistics for debugging
    getCacheStats() {
        return apiCache.getStats();
    }
};

// Auto-cleanup expired cache every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        cacheUtils.performCleanup();
    }, 5 * 60 * 1000);
}
