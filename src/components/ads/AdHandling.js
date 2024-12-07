import React, { useState, useEffect } from "react";

const AdHandler = () => {
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [timer, setTimer] = useState(10);
    const [timeLeft, setTimeLeft] = useState(10);
    const [adsPerPage, setAdsPerPage] = useState(9);

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

    let countdown;
    let startTime;
    let remainingTime;

    const startTimer = () => {
        if (countdown) {
            clearInterval(countdown); // Clear any existing interval
        }
    
        startTime = Date.now();
        countdown = setInterval(() => {
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            setTimeLeft((prevTime) => Math.max(0, remainingTime - elapsedTime));
    
            if (remainingTime - elapsedTime <= 0) {
                clearInterval(countdown);
                setTimeLeft(0); // Ensure timeLeft is set to 0 when finished
            }
        }, 1000);
    };
    
    const stopTimer = () => {
        if (countdown) {
            clearInterval(countdown);
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            remainingTime = Math.max(0, remainingTime - elapsedTime);
        }
    };
    
    const handleVisibilityChange = () => {
        if (document.hidden) {
            stopTimer();
        } else {
            // When the user comes back, check if there's remaining time
            if (remainingTime > 0) {
                startTimer();
            }
        }
    };
    
    // Handle ad click
    const handleAdClick = (ad) => {
        setSelectedAd(ad);
        remainingTime = 10; // Reset remaining time
        setTimeLeft(remainingTime);
        startTimer();
    
        document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    // Close modal
    const closeModal = () => {
        if (timeLeft === 0) {
            setSelectedAd(null);
            clearInterval(countdown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    };

    // Determine the aspect ratio class
    const getAspectRatioClass = (ad) => {
        const { width, height } = ad;
        const aspectRatio = width / height;

        if (aspectRatio > 1) {
            return "ad-horizontal"; // 16:9
        } else {
            return "ad-vertical"; // 9:16
        }
    };


    return (
        <div className="pt-10">
           <div className="container pt-4 pb-4 w-11/12 min-h-screen m-auto flex flex-col">
               {/* Ads Display */}
               <div className="ads-container flex-grow grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
                   {ads.map((ad, index) => (
                       <div
                           className={`ad relative rounded-xl border-5 border-y-cyan-500 shadow-md overflow-hidden cursor-pointer ${getAspectRatioClass(ad)}`}
                           key={index}
                           onClick={() => handleAdClick(ad)}
                       >
                           <img
                               className="object-cover w-full h-full"
                               src={ad.image_url}
                               alt={ad.title}
                           />
                           <div className="absolute rounded-3xl bg-white text-black">
                               <p>{ad.timer}🕒</p>
                           </div>
                           <div className="ad-info absolute bottom-0 left-0 bg-black bg-opacity-20 text-white p-2">
                               <h3 className="text-lg font-bold">{ad.title}</h3>
                               <p className="text-sm">Token Reward: {ad.token_reward}</p>
                           </div>
                       </div>
                   ))}
               </div>

               {selectedAd && (
                   <div className="p-4 fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                       <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border-2 border-opacity-40 border-pink-600 dark:border-blue-600 max-w-screen-lg w-full max-h-full md:max-h-[90vh] md:w-auto flex flex-col items-center justify-center overflow-y-auto">
                           <span onClick={closeModal} className="absolute top-2 right-2 text-3xl font-bold cursor-pointer">
                               &times;
                           </span>
                           <img
                               src={selectedAd.image_url}
                               alt={selectedAd.title}
                               className="object-contain max-w-full max-h-80 md:max-h-96"
                           />
                           <div className="mt-4">
                               <h3 className="text-lg font-bold">{selectedAd.title}</h3>
                               <p className="text-sm">Posted by: {selectedAd.posted_by}</p>
                               <p className="text-sm">Description: {selectedAd.description}</p>
                               <p className="text-sm">Region: {selectedAd.region}</p>
                               <p className="text-sm">Token Reward: {selectedAd.token_reward}</p>
                           </div>
                           <div className="mt-4 text-center">
                               <p className="text-sm">You can close this ad in {timeLeft} seconds</p>
                           </div>
                     </div>
               </div>
           )}
       </div>
   </div>
    );
};

export default AdHandler;
