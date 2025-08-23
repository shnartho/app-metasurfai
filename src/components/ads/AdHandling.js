import React, { useState, useEffect, useRef } from "react";
import { apiCall } from "../../utils/api";
import ScriptAd from "./ScriptAds";
import { addScriptAdsToExistingAds } from "./ScriptAdUtils";

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
            
            if (!parsedProfile.localBalance) {
                const updatedProfile = { ...parsedProfile, localBalance: 0 };
                setUserProfile(updatedProfile);
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            }
            
            const watchedAdsData = localStorage.getItem('watchedAds');
            if (watchedAdsData) {
                setWatchedAds(new Set(JSON.parse(watchedAdsData)));
            }
        } else {
            setIsAuthenticated(false);
            setUserProfile(null);
        }
    }, []);

    // const isNewApi = () => process.env.USE_NEW_API === 'true';
    useEffect(() => {
        const fetchAds = async () => {
            try {
                // Always use old API for ads
                const adsData = await apiCall("ads", { base: 'new' });
                // Defensive: Only set ads if response is an array
                if (Array.isArray(adsData)) {
                    // Add script-based ads to the mix
                    const combinedAds = addScriptAdsToExistingAds(adsData, 3);
                    const sortedAds = combinedAds.sort((a, b) => b.reward_per_view - a.reward_per_view);
                    setAds(sortedAds);
                    localStorage.setItem('Ads', JSON.stringify(sortedAds));
                } else {
                    // If no ads from API, still create script ads
                    const scriptAdsOnly = addScriptAdsToExistingAds([], 3);
                    setAds(scriptAdsOnly);
                    localStorage.setItem('Ads', JSON.stringify(scriptAdsOnly));
                }
            } catch (error) {
                // Even on error, create script ads
                const scriptAdsOnly = addScriptAdsToExistingAds([], 3);
                setAds(scriptAdsOnly);
                localStorage.setItem('Ads', JSON.stringify(scriptAdsOnly));
                console.error("Error fetching ads:", error);
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
            if (width >= 1024) {
                setAdsPerPage(9); // 3x3 grid
            } else if (width >= 600) {
                setAdsPerPage(6); // 2x3 grid
            } else {
                setAdsPerPage(3); // 1x3 grid
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

        startTimeRef.current = Date.now();
        countdownRef.current = setInterval(() => {
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000);
            const newTimeLeft = Math.max(0, remainingTimeRef.current - elapsedTime);
            setTimeLeft(newTimeLeft);
            
            const progress = ((10 - newTimeLeft) / 10) * 100;
            setWatchProgress(progress);

            if (remainingTimeRef.current - elapsedTime <= 0) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
                setTimeLeft(0);
                setWatchProgress(100);
            }
        }, 100);
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
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        startTimeRef.current = null;
        remainingTimeRef.current = 10;
        setTimeLeft(10);
        setWatchProgress(0);
    };
    
    const handleVisibilityChange = () => {
        if (document.hidden) {
            stopTimer();
        } else {
            if (remainingTimeRef.current > 0) {
                startTimer();
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
            // Start fresh timer for unwatched ads (except script ads)
            if (nextAd.type !== 'script') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            } else {
                // For script ads, just prepare the timer
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                document.addEventListener("visibilitychange", handleVisibilityChange);
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
            // Start fresh timer for unwatched ads (except script ads)
            if (prevAd.type !== 'script') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            } else {
                // For script ads, just prepare the timer
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                document.addEventListener("visibilitychange", handleVisibilityChange);
            }
        } else {
            // Already watched or not authenticated - show as complete
            setTimeLeft(0);
            setWatchProgress(isAdWatched(prevAd) ? 100 : 0);
        }
    };

    // Handle ad click
    const handleAdClick = (ad) => {
        // Complete cleanup of any existing timer
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        
        const adIndex = ads.findIndex(a => (a.id || a._id) === (ad.id || ad._id));
        setCurrentAdIndex(adIndex);
        setSelectedAd(ad);
        
        if (isAuthenticated && !isAdWatched(ad)) {
            // Start timer for unwatched ads (except script ads which start on load)
            if (ad.type !== 'script') {
                setTimeout(() => {
                    remainingTimeRef.current = 10;
                    setTimeLeft(10);
                    setWatchProgress(0);
                    startTimer();
                    document.addEventListener("visibilitychange", handleVisibilityChange);
                }, 100);
            } else {
                // For script ads, just set up the timer values, but don't start yet
                // The timer will start when the script ad loads via the onLoad callback
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                document.addEventListener("visibilitychange", handleVisibilityChange);
            }
        } else {
            // Already watched or not authenticated - show appropriate state
            setTimeLeft(0);
            setWatchProgress(isAdWatched(ad) ? 100 : 0);
        }
    };

    // Cleanup timer when component unmounts or modal closes
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            // Extra cleanup to handle any potential redirect visibility handlers
            const cleanupRedirectHandlers = () => {
                const clone = document.addEventListener;
                document.addEventListener = function(type, listener, options) {
                    if (type === "visibilitychange" && 
                        listener.toString().includes("wasRedirectedRef")) {
                        document.removeEventListener(type, listener);
                    }
                    return clone.apply(this, arguments);
                };
            };
            cleanupRedirectHandlers();
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
            // Update local UI first (optimistic)
            const newBalance = (userProfile.localBalance || 0) + selectedAd.token_reward;
            const updatedProfile = {
                ...userProfile,
                localBalance: newBalance
            };

            const newWatchedAds = new Set(watchedAds);
            newWatchedAds.add(adId);

            setUserProfile(updatedProfile);
            setWatchedAds(newWatchedAds);

            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            localStorage.setItem('watchedAds', JSON.stringify([...newWatchedAds]));

            // Call backend to update user balance
            try {
                const token = localStorage.getItem('authToken') || '';
                // apiMapNew.updateBalance expects body.amount -> will be transformed
                const balanceResp = await apiCall('updateBalance', { body: { amount: selectedAd.token_reward }, token, base: 'new' });
                // If backend returns a balance, sync it
                if (balanceResp && (balanceResp.balance !== undefined || balanceResp.newBalance !== undefined)) {
                    const serverBalance = balanceResp.balance !== undefined ? balanceResp.balance : balanceResp.newBalance;
                    const syncedProfile = { ...updatedProfile, localBalance: parseFloat(serverBalance) };
                    setUserProfile(syncedProfile);
                    localStorage.setItem('userProfile', JSON.stringify(syncedProfile));
                }
            } catch (err) {
                console.error('Failed to update balance on server:', err);
                // Don't block user from receiving the local reward; optionally notify
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
            showRewardNotification(selectedAd.token_reward, newBalance);

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
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-[60] bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <div>
                    <div class="font-bold">+$${reward} Earned!</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };
    
    // Show redirect notification
    const showRedirectNotification = (message, isSuccess = true) => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-[60] bg-gradient-to-r ${isSuccess ? 'from-blue-500 to-pink-500' : 'from-red-500 to-yellow-500'} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    ${isSuccess 
                        ? '<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />'
                        : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
                    }
                </svg>
                <div>
                    <div class="font-bold">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
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
        
        // Pause current timer if running
        stopTimer();

        // Open the redirect URL
        window.open(url, '_blank');

        // Show notification to user
        showRedirectNotification('Stay on the site for 10 seconds to earn reward!', true);

        // Set a visibility change handler specifically for redirect
        const handleRedirectVisibility = () => {
            if (!document.hidden && wasRedirectedRef.current) {
                // User returned to the site
                const timeSpent = Math.floor((Date.now() - redirectStartTimeRef.current) / 1000);
                
                if (timeSpent >= 10) {
                    // They stayed long enough, mark as completed and reward
                    wasRedirectedRef.current = false;
                    document.removeEventListener("visibilitychange", handleRedirectVisibility);
                    setTimeLeft(0);
                    setWatchProgress(100);
                    setTimeout(() => {
                        claimLocalRewardAndNext();
                    }, 500);
                } else {
                    // They returned too early
                    wasRedirectedRef.current = false;
                    document.removeEventListener("visibilitychange", handleRedirectVisibility);
                    showRedirectNotification(`You need to stay on the site for 10 seconds to earn rewards! You only stayed for ${timeSpent} seconds.`, false);
                    
                    // Resume the normal timer
                    startTimer();
                }
            }
        };

        document.addEventListener("visibilitychange", handleRedirectVisibility);
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
                                   {ad.type === 'script' ? (
                                       <div className="script-ad-preview" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                           <div className="flex flex-col items-center justify-center text-center p-2">
                                               <svg className="w-10 h-10 text-pink-500 dark:text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                               </svg>
                                               <span className="font-medium">Interactive Ad</span>
                                               <span className="text-xs mt-1 text-pink-500 dark:text-blue-400">Premium Content</span>
                                           </div>
                                       </div>
                                   ) : (
                                       <img
                                           className="ad-image"
                                           src={ad.image_url}
                                           alt={ad.title}
                                           loading="lazy"
                                       />
                                   )}
                                   {/* Gradient Overlay */}
                                   <div className="ad-overlay"></div>
                                   {/* Token Reward Badge */}
                                   <div className={`token-badge ${isAdWatched(ad) ? 'watched' : ''}`}>
                                       <span>${ad.token_reward}</span>
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
                                   <div className="ad-creator">
                                       <span className="creator-name">{ad.posted_by || 'Anonymous'}</span>
                                   </div>
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
                                   {selectedAd.type === 'script' ? (
                                       <ScriptAd 
                                           adData={selectedAd} 
                                           onLoad={() => {
                                               // When script ad loads, consider it as started watching
                                               if (isAuthenticated && !isAdWatched(selectedAd)) {
                                                   startTimer();
                                               }
                                           }}
                                       />
                                   ) : (
                                       <img
                                           src={selectedAd.image_url}
                                           alt={selectedAd.title}
                                           className="shorts-image"
                                       />
                                   )}
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
                                                       <button onClick={goToNextAd} className="next-ad-btn">
                                                           Next Ad
                                                       </button>
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
                                                               Earn ${selectedAd.token_reward}
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
                                                       
                                                       {/* Script ad specific message */}
                                                       {selectedAd.type === 'script' && timeLeft > 0 && (
                                                           <div className="script-ad-message mt-3 p-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm text-center">
                                                               <div className="flex items-center justify-center mb-1">
                                                                   <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                   </svg>
                                                                   <span className="font-semibold">Premium Interactive Content</span>
                                                               </div>
                                                               View for 10 seconds to earn your reward
                                                           </div>
                                                       )}
                                                       
                                                       {timeLeft === 0 && (
                                                           <div className="action-buttons">
                                                               <button 
                                                                   onClick={claimLocalRewardAndNext}
                                                                   className="claim-btn"
                                                               >
                                                                   Claim ${selectedAd.token_reward}
                                                               </button>
                                                               <button 
                                                                   onClick={goToNextAd}
                                                                   className="skip-btn"
                                                               >
                                                                   Skip
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
                                               <h4 className="login-title">Want to Earn ${selectedAd.token_reward}?</h4>
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