import React, { useState, useEffect, useRef } from "react";

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

    // Fetch ads when the component mounts
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch("https://metasurfai-public-api.fly.dev/v2/ads");
                const data = await response.json();
                const sortedAds = data.sort((a, b) => b.token_reward - a.token_reward); 
                setAds(sortedAds);
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        fetchAds();
    }, []);


    // //Fetch ads from new api
    //     useEffect(() => {
    //         const fetchAds = async () => {
    //             try {
    //                 const getUserRegion = async () => {
    //                     try {
    //                         const response = await fetch('https://ipapi.co/country/');
    //                         const country = await response.text();
    //                         return country.trim().toUpperCase();
    //                 } catch (error) {
    //                     console.error('Error getting user region:', error);
    //                     return 'PT'; // fallback
    //                 }
    //             };

    //             const region = await getUserRegion();
    //             const response = await fetch("https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/dev/images", {
    //                 method: 'GET',
    //                 headers: {
    //                     'x-fetch-all-images': 'true',
    //                     'x-region': region,
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //             const data = await response.json();
    //             const sortedAds = data.sort((a, b) => b.token_reward - a.token_reward); 
    //                 setAds(sortedAds);
    //             } catch (error) {
    //                 console.error("Error fetching ads:", error);
    //             }
    //         };
    //         fetchAds();
    //     }, []);

    // Add a new function to sort ads based on watched status
    const getSortedAds = () => {
        if (!ads.length) return [];
        
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
            // Start fresh timer for unwatched ads
            setTimeout(() => {
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                startTimer();
                document.addEventListener("visibilitychange", handleVisibilityChange);
            }, 100);
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
            // Start fresh timer for unwatched ads
            setTimeout(() => {
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                startTimer();
                document.addEventListener("visibilitychange", handleVisibilityChange);
            }, 100);
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
            // Start timer for unwatched ads
            setTimeout(() => {
                remainingTimeRef.current = 10;
                setTimeLeft(10);
                setWatchProgress(0);
                startTimer();
                document.addEventListener("visibilitychange", handleVisibilityChange);
            }, 100);
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
            document.removeEventListener("visibilitychange", handleVisibilityChange);
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

    // //New api to update balance
    // const claimLocalRewardAndNextN = async () => {
    //     if (!isAuthenticated || watchProgress !== 100 || !selectedAd || !authToken) return;

    //     const adId = selectedAd.id || selectedAd._id;
        
    //     if (watchedAds.has(adId)) {
    //         alert('You have already earned a reward for this ad!');
    //         return;
    //     }

    //     try {
    //         const response = await fetch("https://ty0xbob8r8.execute-api.us-east-1.amazonaws.com/dev/user/balance", {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${authToken}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 balance: selectedAd.token_reward
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const result = await response.json();
    //         console.log('Balance update result:', result);

    //         // Only update watched ads status locally
    //         const newWatchedAds = new Set(watchedAds);
    //         newWatchedAds.add(adId);
    //         setWatchedAds(newWatchedAds);
    //         localStorage.setItem('watchedAds', JSON.stringify([...newWatchedAds]));
            
    //         showRewardNotification(selectedAd.token_reward);
            
    //         // Auto-navigate to next ad after 1.5 seconds
    //         setTimeout(() => {
    //             goToNextAd();
    //         }, 1500);

    //     } catch (error) {
    //         console.error('Error claiming reward:', error);
    //         alert('Error claiming reward. Please try again.');
    //     }
    // };

    // Show reward notification
    const showRewardNotification = (reward, newBalance) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-[60] bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <div>
                    <div class="font-bold">+$${reward} Earned!</div>
                    <div class="text-sm">Balance: $${newBalance.toFixed(2)}</div>
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

    // Close modal
    const closeModal = () => {
        resetTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        setSelectedAd(null);
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
                   {getSortedAds().map((ad, index) => (
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
                   ))}
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