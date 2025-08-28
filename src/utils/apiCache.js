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
            
            console.log(`[ApiCache] Cached ${key} for user ${userId}, expires in ${Math.round((expireTime - Date.now()) / 1000)}s`);
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
                console.log(`[ApiCache] No cache found for ${key}`);
                return null;
            }
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is expired
            if (now > cacheData.expires) {
                console.log(`[ApiCache] Cache expired for ${key}, expired ${Math.round((now - cacheData.expires) / 1000)}s ago`);
                this.remove(key, userId);
                return null;
            }
            
            // Check if cache is for current user
            const currentUser = userId || this.getCurrentUserId();
            if (cacheData.userId !== currentUser) {
                console.log(`[ApiCache] Cache user mismatch for ${key}, expected ${currentUser}, got ${cacheData.userId}`);
                return null;
            }
            
            console.log(`[ApiCache] Cache hit for ${key}, ${Math.round((cacheData.expires - now) / 1000)}s remaining`);
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
            console.log(`[ApiCache] Removed cache for ${key}`);
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
            console.log(`[ApiCache] Cleared ${keysToRemove.length} cache entries for user ${user}`);
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
            if (keysToRemove.length > 0) {
                console.log(`[ApiCache] Cleaned up ${keysToRemove.length} expired cache entries`);
            }
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
    const nonCacheableActions = ['login', 'signup', 'createAd', 'updateAd', 'deleteAd', 'updateBalance', 'uploadImage'];
    const shouldCache = !skipCache && !nonCacheableActions.includes(action);
    
    // For read operations, try cache first
    if (shouldCache && !forceRefresh) {
        const cached = apiCache.get(cacheKey);
        if (cached !== null) {
            console.log(`[CachedApiCall] Cache HIT for ${action}`);
            return cached;
        }
    }
    
    // Check if the same request is already pending to prevent duplicates
    if (shouldCache && !forceRefresh) {
        const pendingRequest = apiCache.getPending(action, { body, token, base });
        if (pendingRequest) {
            console.log(`[CachedApiCall] Request already pending for ${action}, waiting for result...`);
            return await pendingRequest;
        }
    }
    
    // Import apiCall to avoid circular dependency
    const { apiCall } = await import('./api');
    
    // Create the API call promise
    const apiCallPromise = (async () => {
        try {
            console.log(`[CachedApiCall] Making API call: ${action} (cache: ${shouldCache ? 'enabled' : 'disabled'})`);
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
            console.error(`[CachedApiCall] API call failed for ${action}:`, error);
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
        console.log('[CacheUtils] Invalidated user content cache');
    },

    // Invalidate profile cache when balance or profile updates
    invalidateProfile() {
        apiCache.remove('profile');
        console.log('[CacheUtils] Invalidated profile cache');
    },

    // Clear all cache when user logs out
    clearAllOnLogout() {
        apiCache.clearUserCache();
        localStorage.removeItem('Ads');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('watchedAds');
        console.log('[CacheUtils] Cleared all cache on logout');
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
            
            console.log(`[CacheUtils] Cleared ${keysToRemove.length} cache entries from previous users`);
        } catch (e) {
            console.warn('[CacheUtils] Failed to clear previous user cache:', e);
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
