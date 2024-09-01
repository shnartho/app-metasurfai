import React, { useState, useEffect } from "react";

const AdHandler = () => {
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [timer, setTimer] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [adsPerPage, setAdsPerPage] = useState(9); // Default to 9 ads per page

    // Fetch ads when the component mounts
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch("https://metasurfai-public-api.fly.dev/v1");
                const data = await response.json();
                console.log(data);
                setAds(data);
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

    // Pagination logic
    const indexOfLastAd = currentPage * adsPerPage;
    const indexOfFirstAd = indexOfLastAd - adsPerPage;
    const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);

    const totalPages = Math.ceil(ads.length / adsPerPage);

    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="container pt-4 w-11/12 min-h-screen m-auto flex flex-col">
            {/* Ads Display */}
            <div className="ads-container flex-grow grid gap-4">
                {currentAds.map((ad, index) => (
                    <div
                        className="ad relative border-5 shadow-md overflow-hidden cursor-pointer"
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
                <div className="popup-ads fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border-2 border-opacity-40 border-pink-600">
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
             {/* Pagination Controls */}
             <div className="pagination-controls mt-4 flex justify-center space-x-4">
                <button
                    onClick={goToPreviousPage}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-white">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={goToNextPage}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
        
    );
};

export default AdHandler;
