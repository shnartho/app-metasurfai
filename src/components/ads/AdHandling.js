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
                const response = await fetch("https://metasurfai-public-api.fly.dev/v2");
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

    // Handle ad click
    const handleAdClick = (ad) => {
        setSelectedAd(ad);
        setTimer(10); 
        setTimeLeft(10);

        let countdown;

        const startTimer = () => {
            countdown = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(countdown);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        };

        const stopTimer = () => {
            clearInterval(countdown);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopTimer();
            } else {
                startTimer();
            }
        };

        startTimer();

        document.addEventListener("visibilitychange", handleVisibilityChange);

        const cleanup = () => {
            clearInterval(countdown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };

        if (timer === 0) {
            cleanup();
        }
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
        <div className="container pt-4 pb-4 w-11/12 min-h-screen m-auto flex flex-col">
            {/* Ads Display */}
            <div className="ads-container flex-grow grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
                {ads.map((ad, index) => (
                    <div
                        className={`ad relative rounded-xl border-5 shadow-md overflow-hidden cursor-pointer ${getAspectRatioClass(ad)}`}
                        key={index}
                        onClick={() => handleAdClick(ad)}
                    >
                        <img
                            className="object-cover w-full h-full"
                            src={ad.image_url}
                            alt={ad.title}
                        />
                        <div className="ad-info absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2">
                            <h3 className="text-lg font-bold">{ad.title}</h3>
                            <p className="text-sm">Token Reward: {ad.token_reward}</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedAd && (
                <div className="p-4 fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border-2 border-opacity-40 border-pink-600 max-w-screen-lg w-full max-h-full md:max-h-[90vh] md:w-auto flex flex-col items-center justify-center overflow-y-auto">
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
    );
};

export default AdHandler;
