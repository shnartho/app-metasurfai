import React, { useState, useEffect } from "react";

const AdHandler = () => {
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [timer, setTimer] = useState(5); // 5 seconds timer

    // Fetch ads when the component mounts
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch("/api/v1");
                const data = await response.json();
                setAds(data);
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        fetchAds();
    }, []);

    // Handle ad click
    const handleAdClick = (ad) => {
        setSelectedAd(ad);
        setTimer(5); // Reset timer
        const countdown = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    // Close modal
    const closeModal = () => {
        if (timer === 0) {
            setSelectedAd(null);
        }
    };

    return (
        <div className="container w-11/12 min-h-screen m-auto relative">
            <div className="ads-container grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
                {ads.map((ad, index) => (
                    <div
                        className="ad relative h-96 border-5 shadow-md overflow-hidden cursor-pointer"
                        key={index}
                        onClick={() => handleAdClick(ad)}
                    >
                        <img
                            className="h-full w-full object-cover transition-all duration-300 ease-linear hover:scale-110"
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
                <div className="popup-ads fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="relative bg-white p-4 rounded-lg">
                        <span onClick={closeModal} className="absolute top-2 right-2 text-3xl font-bold cursor-pointer">
                            &times;
                        </span>
                        <img
                            src={selectedAd.image_url}
                            alt={selectedAd.title}
                            className="w-full h-auto"
                        />
                        <div className="mt-4">
                            <h3 className="text-lg font-bold">{selectedAd.title}</h3>
                            <p className="text-sm">Posted by: {selectedAd.posted_by}</p>
                            <p className="text-sm">Description: {selectedAd.description}</p>
                            <p className="text-sm">Region: {selectedAd.region}</p>
                            <p className="text-sm">Token Reward: {selectedAd.token_reward}</p>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm">You can close this ad in {timer} seconds</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdHandler;