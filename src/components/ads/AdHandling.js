import React, { useState, useEffect, useRef } from "react";
import { apiCall } from "../../utils/api";
import { cachedApiCall, cacheUtils } from "../../utils/apiCache";
import { balanceUtils } from "../../utils/balanceUtils";

const AdHandler = () => {
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [timer, setTimer] = useState(10);
    const [timeLeft, setTimeLeft] = useState(10);
    const [adsPerPage, setAdsPerPage] = useState(9);
    const [watchProgress, setWatchProgress] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [watchedAds, setWatchedAds] = useState(new Set());

    // Timer refs to persist across renders
    const countdownRef = useRef(null);
    const startTimeRef = useRef(null);
    const remainingTimeRef = useRef(10);
    const redirectTimeoutRef = useRef(null);
    const redirectStartTimeRef = useRef(null);
    const wasRedirectedRef = useRef(false);

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const profile = localStorage.getItem('userProfile');
        
        if (token && profile) {
            setIsAuthenticated(true);
            const parsedProfile = JSON.parse(profile);
            setUserProfile(parsedProfile);
            
            const watchedAdsData = localStorage.getItem('watchedAds');
            if (watchedAdsData) {
                setWatchedAds(new Set(JSON.parse(watchedAdsData)));
            }
        } else {
            setIsAuthenticated(false);
            setUserProfile(null);
        }
    }, []);

    // Fetch ads with caching - reduce API calls
    useEffect(() => {
        const fetchAds = async () => {
            try {
                // Use cached API call - will use cache if valid, otherwise make API call
                const adsData = await cachedApiCall("ads", { 
                    base: 'new' 
                });
                
                // Defensive: Only set ads if response is an array
                if (Array.isArray(adsData)) {
                    const sortedAds = adsData.sort((a, b) => b.reward_per_view - a.reward_per_view);
                    setAds(sortedAds);
                } else {
                    setAds([]);
                }
            } catch (error) {
                setAds([]);
                
                // Fallback to localStorage if API fails
                try {
                    const cachedAds = localStorage.getItem('Ads');
                    if (cachedAds) {
                        const parsedAds = JSON.parse(cachedAds);
                        if (Array.isArray(parsedAds)) {
                            setAds(parsedAds);
                        }
                    }
                } catch (fallbackError) {
                }
            }
        };
        fetchAds();
    }, []);

    // Add a new function to sort ads based on watched status
    const getSortedAds = () => {
        if (!Array.isArray(ads) || !ads.length) return [];
        // Separate watched and unwatched ads
        const unwatchedAds = ads.filter(ad => !isAdWatched(ad));
        const watchedAds = ads.filter(ad => isAdWatched(ad));
        // Sort unwatched ads by token reward (highest first)
        const sortedUnwatched = unwatchedAds.sort((a, b) => b.token_reward - a.token_reward);
        // Sort watched ads by token reward (highest first) 
        const sortedWatched = watchedAds.sort((a, b) => b.token_reward - a.token_reward);
        // Return unwatched ads first, then watched ads
        return [...sortedUnwatched, ...sortedWatched];
    };

    // Adjust adsPerPage based on screen width
    useEffect(() => {
        const updateAdsPerPage = () => {
            const width = window.innerWidth;
            if (width >= 768) {
                setAdsPerPage(12); // 4x3 grid (4 columns, 3 rows) for desktop/tablet
            } else if (width >= 481) {
                setAdsPerPage(9); // 3x3 grid for smaller tablets  
            } else {
                setAdsPerPage(6); // 2x3 grid for mobile
            }
        };

        updateAdsPerPage();
        window.addEventListener("resize", updateAdsPerPage);
        return () => window.removeEventListener("resize", updateAdsPerPage);
    }, []);

    const startTimer = () => {
        // Clear any existing timer
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        // Ensure time left is set to the current remaining time
        setTimeLeft(remainingTimeRef.current);
        
        // Set the start time for calculating elapsed time
        startTimeRef.current = Date.now();
        
        // Use a more precise interval for smoother progress
        countdownRef.current = setInterval(() => {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;
            const newTimeLeft = Math.max(0, Math.ceil(remainingTimeRef.current - elapsedSeconds));
            
            // Only update UI state if the value changed
            if (newTimeLeft !== timeLeft) {
                setTimeLeft(newTimeLeft);
            }
            
            // Calculate progress as a percentage
            const progress = 100 - ((newTimeLeft / 10) * 100);
            setWatchProgress(Math.min(100, Math.max(0, progress)));

            // Check if timer is complete
            if (newTimeLeft <= 0) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
                setTimeLeft(0);
                setWatchProgress(100);
                remainingTimeRef.current = 0;
            }
        }, 100); // Update 10 times per second for smoother animation
    };
    
    const stopTimer = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000);
            remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsedTime);
        }
    };

    const resetTimer = () => {
        // Complete reset of timer
        try {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        } catch (e) {
            console.warn('Error clearing timer interval:', e);
        }
        
        startTimeRef.current = null;
        remainingTimeRef.current = 10;
        
        // Update UI state
        setTimeLeft(10);
        setWatchProgress(0);
        
        // Also reset any redirect timers
        try {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
            wasRedirectedRef.current = false;
        } catch (e) {
            console.warn('Error clearing redirect timer:', e);
        }
    };
    
    const handleVisibilityChange = () => {
        try {
            if (document.hidden) {
                stopTimer();
            } else {
                if (remainingTimeRef.current > 0) {
                    startTimer();
                }
            }
        } catch (e) {
            console.warn('Error in visibility change handler:', e);
            // If there's an error, make sure timers are cleaned up
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        }
    };

    // Navigate to next ad
    const goToNextAd = () => {
        if (ads.length === 0) return;
        
        // Complete cleanup of current timer
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        
        const nextIndex = (currentAdIndex + 1) % ads.length;
        setCurrentAdIndex(nextIndex);
        setSelectedAd(ads[nextIndex]);
        
        // Check if next ad is already watched
        const nextAd = ads[nextIndex];
        if (isAuthenticated && !isAdWatched(nextAd)) {
            // For redirect ads, don't start timer automatically
            if (nextAd.type === 'redirect') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    // Don't start timer automatically for redirect ads
                }, 100);
            } else {
                // Start fresh timer for unwatched regular ads
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            }
        } else {
            // Already watched or not authenticated - show as complete
            setTimeLeft(0);
            setWatchProgress(isAdWatched(nextAd) ? 100 : 0);
        }
    };

    // Navigate to previous ad
    const goToPreviousAd = () => {
        if (ads.length === 0) return;
        
        // Complete cleanup of current timer
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        
        const prevIndex = currentAdIndex === 0 ? ads.length - 1 : currentAdIndex - 1;
        setCurrentAdIndex(prevIndex);
        setSelectedAd(ads[prevIndex]);
        
        // Check if previous ad is already watched
        const prevAd = ads[prevIndex];
        if (isAuthenticated && !isAdWatched(prevAd)) {
            // For redirect ads, don't start timer automatically
            if (prevAd.type === 'redirect') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    // Don't start timer automatically for redirect ads
                }, 100);
            } else {
                // Start fresh timer for unwatched regular ads
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            }
        } else {
            // Already watched or not authenticated - show as complete
            setTimeLeft(0);
            setWatchProgress(isAdWatched(prevAd) ? 100 : 0);
        }
    };

    // Handle ad click
    const handleAdClick = (ad) => {
        if (!ad) return;
        
        // Complete cleanup of any existing timer
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        
        const adIndex = ads.findIndex(a => (a.id || a._id) === (ad.id || ad._id));
        setCurrentAdIndex(adIndex);
        setSelectedAd(ad);
        
        if (isAuthenticated && !isAdWatched(ad)) {
            // For redirect ads, don't start timer automatically - wait for user to click redirect
            if (ad.type === 'redirect') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    // Don't start timer automatically for redirect ads
                }, 100);
            } else {
                // Start timer for regular ads
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            }
        } else {
            // Already watched or not authenticated - show appropriate state
            setTimeLeft(0);
            setWatchProgress(isAdWatched(ad) ? 100 : 0);
        }
    };

    // Cleanup timer when component unmounts or modal closes
    useEffect(() => {
        // Create a function to safely remove event listeners
        const safeRemoveEventListener = (type, listener) => {
            try {
                document.removeEventListener(type, listener);
            } catch (err) {
                console.warn('Error removing event listener:', err);
            }
        };

        // Function to cleanup any notifications that might be in the DOM
        const cleanupNotifications = () => {
            try {
                // Find all notifications that our component might have created
                const notifications = document.querySelectorAll('.reward-notification, [class*="fixed top-4 right-4 z-[60]"]');
                
                notifications.forEach(notification => {
                    try {
                        // Clear any timeouts associated with this notification
                        const showTimeoutId = notification.dataset.showTimeoutId;
                        const hideTimeoutId = notification.dataset.hideTimeoutId; 
                        const removeTimeoutId = notification.dataset.removeTimeoutId;
                        
                        if (showTimeoutId) clearTimeout(parseInt(showTimeoutId));
                        if (hideTimeoutId) clearTimeout(parseInt(hideTimeoutId));
                        if (removeTimeoutId) clearTimeout(parseInt(removeTimeoutId));
                        
                        // If notification is still in the DOM, remove it
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    } catch (e) {
                        console.warn('Error cleaning up notification:', e);
                    }
                });
            } catch (e) {
                console.warn('Error in notification cleanup:', e);
            }
        };

        return () => {
            // Cleanup all timers
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
            
            // Safely remove event listeners
            safeRemoveEventListener("visibilitychange", handleVisibilityChange);
            
            // Check if getEventListeners is available (Chrome DevTools)
            if (typeof getEventListeners === 'function') {
                try {
                    const allEventListeners = getEventListeners(document);
                    if (allEventListeners && allEventListeners.visibilitychange) {
                        allEventListeners.visibilitychange.forEach(entry => {
                            if (entry.listener.toString().includes('wasRedirectedRef') || 
                                entry.listener.toString().includes('redirectStartTimeRef') ||
                                entry.listener.toString().includes('handleRedirect')) {
                                safeRemoveEventListener("visibilitychange", entry.listener);
                            }
                        });
                    }
                } catch (e) {
                    console.warn('Error cleaning up event listeners:', e);
                }
            }
            
            // Clean up any notifications
            cleanupNotifications();
        };
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!selectedAd) return;
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                goToPreviousAd();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                goToNextAd();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [selectedAd, currentAdIndex, ads]);

    // Function to claim local reward and auto-navigate to next ad
    const claimLocalRewardAndNext = async () => {
        if (!isAuthenticated || watchProgress !== 100 || !selectedAd) return;

        const adId = selectedAd.id || selectedAd._id;
        
        if (watchedAds.has(adId)) {
            alert('You have already earned a reward for this ad!');
            return;
        }

        try {
            // Use reward_per_view for the reward amount
            const rewardAmount = selectedAd.reward_per_view || selectedAd.token_reward || 0;
            
            // Update balance using simple balance utility
            if (!balanceUtils.addToBalance(rewardAmount, `Earned $${rewardAmount} for watching ad: ${selectedAd.title}`)) {
                throw new Error('Failed to update balance');
            }

            // Update watched ads set
            const newWatchedAds = new Set(watchedAds);
            newWatchedAds.add(adId);
            setWatchedAds(newWatchedAds);

            // Store updated watched ads in localStorage
            localStorage.setItem('watchedAds', JSON.stringify([...newWatchedAds]));

            // Update userProfile state to reflect new balance
            setUserProfile(balanceUtils.getUserProfile());
            
            // Profile update event is dispatched by balanceUtils

            // Call backend to update user balance with optimized API calls
            try {
                const token = localStorage.getItem('authToken') || '';
                
                // Only call API if we have a valid token and the amount is meaningful
                if (token && rewardAmount > 0) {
                    const balanceResp = await apiCall('updateBalance', { 
                        body: { amount: rewardAmount }, 
                        token, 
                        base: 'new' 
                    });
                    
                    // If backend returns a balance, sync it using simple utility
                    if (balanceResp && balanceResp.balance !== undefined) {
                        const serverBalance = parseFloat(balanceResp.balance);
                        
                        // Use balance utility to sync with server balance
                        balanceUtils.updateBalance(serverBalance, 'Synced with server after reward');
                        setUserProfile(balanceUtils.getUserProfile());
                        
                        // Invalidate profile cache since balance changed
                        cacheUtils.invalidateProfile();
                    }
                }
            } catch (err) {
                console.warn('[AdHandling] Server balance sync failed, using local balance:', err);
                // Continue with local update even if server sync fails
            }

            // Call backend to increment ad view_count
            try {
                const token = localStorage.getItem('authToken') || '';
                const currentViewCount = (selectedAd.view_count || selectedAd.views || 0);
                const updates = { view_count: currentViewCount + 1 };
                await apiCall('updateAd', { body: { id: adId, updates }, token, base: 'new' });

                // Update local ads state to reflect incremented view_count
                setAds(prev => {
                    if (!Array.isArray(prev)) return prev;
                    return prev.map(a => {
                        const idA = a.id || a._id;
                        if (idA === adId) {
                            return { ...a, view_count: (a.view_count || a.views || 0) + 1 };
                        }
                        return a;
                    });
                });
            } catch (err) {
                console.error('Failed to update ad view_count on server:', err);
                // Non-fatal
            }

            // Show reward notification
            showRewardNotification(rewardAmount);

            // Auto-navigate to next ad after 1.5 seconds
            setTimeout(() => {
                goToNextAd();
            }, 1500);

        } catch (error) {
            console.error('Error claiming reward:', error);
            alert('Error claiming reward. Please try again.');
        }
    };

    // Show reward notification
    const showRewardNotification = (reward/*, newBalance - kept for compatibility */) => {
        try {
            // Check if document.body exists
            if (!document || !document.body) {
                console.warn('Document body not available for notification');
                return;
            }
            
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 z-[60] bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500';
            notification.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="font-bold">
                            <img src="/TokenLogo.png" alt="Token" class="w-4 h-4 inline-block mr-1" />
                            +${reward} Earned!
                        </div>
                    </div>
                </div>
            `;
            
            // Store timeout IDs so we can clean them up if needed
            let showTimeoutId, hideTimeoutId, removeTimeoutId;
            
            // Safely append to document
            document.body.appendChild(notification);
            
            // Show animation with timeout
            showTimeoutId = setTimeout(() => {
                if (notification) {
                    notification.style.transform = 'translateX(0)';
                }
            }, 100);
            
            // Hide after delay
            hideTimeoutId = setTimeout(() => {
                if (notification) {
                    notification.style.transform = 'translateX(100%)';
                    
                    // Remove after animation completes with safety check
                    removeTimeoutId = setTimeout(() => {
                        try {
                            // Check if notification still exists and has a parent
                            if (notification && notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        } catch (e) {
                            console.warn('Error removing notification:', e);
                        }
                    }, 500);
                }
            }, 3000);
            
            // Add data attributes to keep track of timeouts
            notification.dataset.showTimeoutId = showTimeoutId;
            notification.dataset.hideTimeoutId = hideTimeoutId;
            notification.dataset.removeTimeoutId = removeTimeoutId;
            
            // Return the notification in case we need to clean it up externally
            return notification;
        } catch (error) {
            console.error('Error showing reward notification:', error);
        }
    };
    
    // Show redirect notification
    const showRedirectNotification = (message, isSuccess = true) => {
        try {
            // Check if document.body exists
            if (!document || !document.body) {
                console.warn('Document body not available for notification');
                return;
            }
            
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-[60] bg-gradient-to-r ${isSuccess ? 'from-blue-500 to-pink-500' : 'from-red-500 to-yellow-500'} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500`;
            notification.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        ${isSuccess 
                            ? '<path fill-rule="evenodd" d="M8 4a4 4 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 001 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />'
                            : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
                        }
                    </svg>
                    <div>
                        <div class="font-bold">${message}</div>
                    </div>
                </div>
            `;
            
            // Store timeout IDs so we can clean them up if needed
            let showTimeoutId, hideTimeoutId, removeTimeoutId;
            
            // Safely append to document
            document.body.appendChild(notification);
            
            // Show animation with timeout
            showTimeoutId = setTimeout(() => {
                if (notification) {
                    notification.style.transform = 'translateX(0)';
                }
            }, 100);
            
            // Hide after delay (longer for redirect notifications)
            hideTimeoutId = setTimeout(() => {
                if (notification) {
                    notification.style.transform = 'translateX(100%)';
                    
                    // Remove after animation completes with safety check
                    removeTimeoutId = setTimeout(() => {
                        try {
                            // Check if notification still exists and has a parent
                            if (notification && notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        } catch (e) {
                            console.warn('Error removing notification:', e);
                        }
                    }, 500);
                }
            }, 5000);
            
            // Add data attributes to keep track of timeouts
            notification.dataset.showTimeoutId = showTimeoutId;
            notification.dataset.hideTimeoutId = hideTimeoutId;
            notification.dataset.removeTimeoutId = removeTimeoutId;
            
            // Return the notification in case we need to clean it up externally
            return notification;
        } catch (error) {
            console.error('Error showing redirect notification:', error);
        }
    };

    const closeModal = () => {
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        setSelectedAd(null);
    };

    // Handle redirect for redirect-type ads
    const handleRedirect = (url) => {
        if (!url || !selectedAd || !isAuthenticated || watchedAds.has(selectedAd.id || selectedAd._id)) {
            return;
        }

        // Set redirect flag
        wasRedirectedRef.current = true;
        redirectStartTimeRef.current = Date.now();
        
        // For redirect ads, we want the timer to start only when they click redirect
        const isRedirectType = selectedAd.type === 'redirect';
        
        if (isRedirectType) {
            // For redirect ads, we START the timer when they click redirect
            remainingTimeRef.current = 10; // Reset to full time for redirect
            setTimeLeft(10);
            setWatchProgress(0);
            
            // Clear any existing timer and start fresh
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
            
            // Start the timer immediately
            startTimer();
            
        } else {
            // For normal ads, pause the timer when they leave
            stopTimer();
        }

        // Open the redirect URL
        window.open(url, '_blank');

        // Show notification to user
        if (isRedirectType) {
            showRedirectNotification('Stay on the external site for 10 seconds to earn reward!', true);
        } else {
            showRedirectNotification('Viewing external site. Timer paused.', true);
        }

        // Create a unique identifier for this redirect event
        const redirectId = Date.now();
        
        // Set a visibility change handler specifically for redirect
        const handleRedirectVisibility = () => {
            if (document.hidden) {
                // User left our site (went to external site)
                if (isRedirectType) {
                    // For redirect ads, this is good - they need to be on the external site
                    // Timer keeps running
                } else {
                    // For regular ads, pause the timer
                    stopTimer();
                }
            } else {
                // User returned to our site
                if (isRedirectType) {
                    // For redirect ads, check if they stayed long enough
                    const timeSpent = Math.floor((Date.now() - redirectStartTimeRef.current) / 1000);
                    
                    if (timeSpent >= 10) {
                        // They stayed long enough, mark as completed and reward
                        wasRedirectedRef.current = false;
                        try {
                            document.removeEventListener("visibilitychange", handleRedirectVisibility);
                        } catch (e) {
                            console.warn('Error removing event listener:', e);
                        }
                        
                        // Stop the timer and show completion
                        if (countdownRef.current) {
                            clearInterval(countdownRef.current);
                            countdownRef.current = null;
                        }
                        setTimeLeft(0);
                        setWatchProgress(100);
                        
                        setTimeout(() => {
                            claimLocalRewardAndNext();
                        }, 500);
                    } else {
                        // They returned too early
                        wasRedirectedRef.current = false;
                        try {
                            document.removeEventListener("visibilitychange", handleRedirectVisibility);
                        } catch (e) {
                            console.warn('Error removing event listener:', e);
                        }
                        showRedirectNotification(`You need to stay on the external site for 10 seconds to earn rewards! You only stayed for ${timeSpent} seconds.`, false);
                        
                        // No reward, reset timer
                        resetTimer();
                    }
                } else {
                    // For normal ads, resume the timer
                    if (remainingTimeRef.current > 0) {
                        startTimer();
                    }
                }
            }
        };

        // Add the event listener
        document.addEventListener("visibilitychange", handleRedirectVisibility);
        
        // Set a cleanup timeout to make sure we remove the listener after a reasonable time
        // (e.g., 2 minutes) even if the user never returns to the site
        redirectTimeoutRef.current = setTimeout(() => {
            try {
                document.removeEventListener("visibilitychange", handleRedirectVisibility);
            } catch (e) {
                console.warn('Error removing event listener in timeout cleanup:', e);
            }
            wasRedirectedRef.current = false;
        }, 120000); // 2 minutes
        
        // Return a cleanup function
        return () => {
            try {
                document.removeEventListener("visibilitychange", handleRedirectVisibility);
            } catch (e) {
                console.warn('Error removing event listener in cleanup function:', e);
            }
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
            wasRedirectedRef.current = false;
        };
    };

    // Add this useEffect for scroll animations
    useEffect(() => {
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const cards = document.querySelectorAll('.ad');
        cards.forEach((card) => {
            card.classList.add('scroll-reveal');
            observer.observe(card);
        });

        return () => {
            cards.forEach((card) => observer.unobserve(card));
        };
    }, [ads]);

    const isAdWatched = (ad) => {
        const adId = ad.id || ad._id;
        return watchedAds.has(adId);
    };

    return (
        <div className="pt-10">
           <div className="container pb-4 w-11/12 min-h-screen m-auto flex flex-col">

               {/* Ads Display - YouTube Shorts Style Grid */}
               <div className="ads-grid">
                   {Array.isArray(ads) && ads.length > 0 ? (
                       getSortedAds().map((ad, index) => (
                           <div
                               className={`ad-card ${isAdWatched(ad) ? 'watched' : ''}`}
                               key={ad.id || ad._id || index}
                               onClick={() => handleAdClick(ad)}
                               style={{ 
                                   animationDelay: `${index * 0.05}s`
                               }}>
                               {/* Image Container with Fixed Aspect Ratio */}
                               <div className="ad-image-container">
                                   <img
                                       className="ad-image"
                                       src={ad.image_url}
                                       alt={ad.title}
                                       loading="lazy"
                                   />
                                   
                                   {/* Gradient overlay */}
                                   <div className="ad-overlay"></div>
                                   
                                   {/* Token Reward Badge */}
                                   <div className={`token-badge ${isAdWatched(ad) ? 'watched' : ''}`}>
                                       <img 
                                           src="/TokenLogo.png" 
                                           alt="Token" 
                                           className="w-4 h-4 inline-block mr-1"
                                       />
                                       <span>{ad.reward_per_view}</span>
                                   </div>
                                   
                                   {/* Watch Status Overlay */}
                                   {!isAuthenticated ? (
                                       <div className="status-overlay">
                                           <div className="status-content">
                                               <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                               </svg>
                                               <span className="status-text">Login to Earn</span>
                                           </div>
                                       </div>
                                   ) : isAdWatched(ad) && (
                                       <div className="status-overlay completed">
                                           <div className="status-content">
                                               <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                               </svg>
                                               <span className="status-text">Completed</span>
                                           </div>
                                       </div>
                                   )}
                               </div>
                               {/* YouTube Shorts Style Info */}
                               <div className="ad-info">
                                   <h3 className="ad-title">{ad.title}</h3>
                                   <p className="ad-description">{ad.description}</p>
                                   <div className="ad-stats">
                                       <span className="ad-region">{ad.region}</span>
                                       <span className="ad-views">{ad.view_count || 0} views</span>
                                   </div>
                               </div>
                           </div>
                       ))
                   ) : (
                       <div className="no-ads-message">No ads to display</div>
                   )}
               </div>

               {/* YouTube Shorts Style Modal */}
               {selectedAd && (
                   <div className="shorts-modal">
                       <div className="shorts-container">
                           {/* Close Button */}
                           <button onClick={closeModal} className="shorts-close">
                               <svg viewBox="0 0 24 24" fill="currentColor">
                                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                               </svg>
                           </button>

                           {/* Main Content Area */}
                           <div className="shorts-content">
                               {/* Image */}
                               <div className="shorts-image-container">
                                   <img
                                       src={selectedAd.image_url}
                                       alt={selectedAd.title}
                                       className="shorts-image"
                                   />
                               </div>

                               {/* Side Controls */}
                               <div className="shorts-controls">
                                   {/* Navigation */}
                                   <button onClick={goToPreviousAd} className="nav-button prev">
                                       <svg viewBox="0 0 24 24" fill="currentColor">
                                           <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                                       </svg>
                                   </button>
                                   
                                   <div className="shorts-counter">
                                       {currentAdIndex + 1}/{ads.length}
                                   </div>
                                   
                                   <button onClick={goToNextAd} className="nav-button next">
                                       <svg viewBox="0 0 24 24" fill="currentColor">
                                           <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                                           </svg>
                                   </button>
                               </div>

                               {/* Bottom Info Panel */}
                               <div className="shorts-info-panel">
                                   {/* Title and Description */}
                                   <div className="shorts-details">
                                       <h2 className="shorts-title">{selectedAd.title}</h2>
                                       <p className="shorts-description">{selectedAd.description}</p>
                                   </div>

                                   {/* Action Panel */}
                                   <div className="shorts-actions">
                                       {isAuthenticated ? (
                                           <>
                                               {isAdWatched(selectedAd) ? (
                                                   <div className="completed-state">
                                                       <div className="completed-icon">
                                                           <svg viewBox="0 0 24 24" fill="currentColor">
                                                               <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                           </svg>
                                                       </div>
                                                       <span className="completed-text">Reward Earned!</span>
                                                       <div className="next-button-container">
                                                           <button onClick={goToNextAd} className="next-ad-btn">
                                                               Next Ad
                                                           </button>
                                                       </div>
                                                   </div>
                                               ) : (
                                                   <div className="watch-progress">
                                                       <div className="progress-header">
                                                           <span className="progress-label">Watch Progress</span>
                                                           <span className="progress-time">
                                                               {timeLeft > 0 ? `${timeLeft}s` : 'Complete!'}
                                                           </span>
                                                       </div>
                                                       
                                                       <div className="progress-bar">
                                                           <div 
                                                               className="progress-fill"
                                                               style={{ width: `${watchProgress}%` }}
                                                           ></div>
                                                       </div>
                                                       
                                                       <div className="progress-info">
                                                           <span className="progress-percentage">
                                                               {Math.round(watchProgress)}% watched
                                                           </span>
                                                           <span className="reward-amount">
                                                               <img 
                                                                   src="/TokenLogo.png" 
                                                                   alt="Token" 
                                                                   className="w-4 h-4 inline-block mr-1"
                                                               />
                                                               Earn {selectedAd.reward_per_view}
                                                           </span>
                                                       </div>
                                                       
                                                       {/* Redirect button for redirect-type ads */}
                                                       {selectedAd.type === 'redirect' && selectedAd.redirection_link && timeLeft > 0 && (
                                                           <div className="action-buttons mt-3">
                                                               <button 
                                                                   onClick={() => handleRedirect(selectedAd.redirection_link)}
                                                                   className="redirect-btn bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-2 px-4 rounded-full w-full transition-all duration-300 hover:from-blue-500 hover:to-pink-500"
                                                               >
                                                                   Visit Site for 10s to Earn Reward
                                                               </button>
                                                           </div>
                                                       )}
                                                       
                                                       {timeLeft === 0 && (
                                                           <div className="action-buttons mt-4 space-y-3">
                                                               <button 
                                                                   onClick={claimLocalRewardAndNext}
                                                                   className="claim-btn w-full"
                                                               >
                                                                   <img 
                                                                       src="/TokenLogo.png" 
                                                                       alt="Token" 
                                                                       className="w-4 h-4 inline-block mr-1"
                                                                   />
                                                                   Claim {selectedAd.reward_per_view}
                                                               </button>
                                                               <button 
                                                                   onClick={goToNextAd}
                                                                   className="skip-btn w-full"
                                                               >
                                                                   Skip to Next Ad
                                                               </button>
                                                           </div>
                                                       )}
                                                   </div>
                                               )}
                                           </>
                                       ) : (
                                           <div className="login-prompt">
                                               <div className="login-icon">
                                                   <svg viewBox="0 0 24 24" fill="currentColor">
                                                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                   </svg>
                                               </div>
                                               <h4 className="login-title">
                                                   <img 
                                                       src="/TokenLogo.png" 
                                                       alt="Token" 
                                                       className="w-4 h-4 inline-block mr-1"
                                                   />
                                                   Want to Earn {selectedAd.reward_per_view}?
                                               </h4>
                                               <p className="login-subtitle">Login to start earning rewards!</p>
                                               <div className="login-buttons">
                                                   <button 
                                                       onClick={() => closeModal()}
                                                       className="login-btn"
                                                   >
                                                       Login
                                                   </button>
                                                   <button 
                                                       onClick={() => closeModal()}
                                                       className="signup-btn"
                                                   >
                                                       Sign Up
                                                   </button>
                                               </div>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
        </div>
    );
};

export default AdHandler;