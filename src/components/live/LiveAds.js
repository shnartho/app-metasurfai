import React, { useState, useEffect } from "react";

const LiveAds = () => {
    const [ads, setAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [adsPerPage, setAdsPerPage] = useState(9); // Default to 9 ads per page
    const [bids, setBids] = useState([]);
    const [newBid, setNewBid] = useState('');


    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch("https://metasurfai-public-api.fly.dev/v2");
                const data = await response.json();
                const sortedAds = data.sort((a, b) => b.token_reward - a.token_reward); // Sort by token_reward descending
                setAds(sortedAds);
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        fetchAds();
    }, []);

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
    const openModal = (ad) => {
        setSelectedAd(ad);
        setBids(ad.bids || []);
    };

    // Close modal
    const closeModal = () => {
            setSelectedAd(null);
            setBids([]);
            setNewBid('');
    };

    const handleBidChange = (e) => {
        setNewBid(e.target.value);
    };

    const handleBidSubmit = (e) => {
        e.preventDefault();
        if (newBid) {
            const updatedBids = [...bids, { bidder: 'You', amount: newBid }];
            setBids(updatedBids);
            setNewBid('');
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
        <div className=''>
            <div className="px-4 ads-container flex-grow grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
                         {ads.map((ad) => (
                                <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-sm dark:shadow-zinc-500 p-4 mb-4">
                                    <img
                                        className="object-cover w-full h-48 rounded-t-3xl"
                                        src={ad.image_url}
                                        alt={ad.title}
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold">{ad.title}</h3>
                                        <p className="text-sm">{ad.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <button onClick={() => openModal(ad)} className="bg-pink-600 dark:bg-blue-600 text-white px-4 py-2 rounded-lg">Start Bid</button>
                                            <p className="text-lg font-bold">Price: $5000</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedAd && (
                            <div className="p-4 fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border-2 border-opacity-40 border-pink-600 dark:border-blue-600 max-w-screen-lg w-full max-h-full md:max-h-[95vh] md:w-auto flex flex-col items-center justify-center overflow-y-auto">
                                    <span onClick={closeModal} className="absolute top-2 right-2 text-3xl font-bold cursor-pointer">
                                        &times;
                                    </span>
                                    <div className="flex flex-col md:flex-row w-full">
                                        <div className="flex-shrink-0 md:w-1/3 p-4">
                                            <img
                                                src={selectedAd.image_url}
                                                alt={selectedAd.title}
                                                className="object-contain max-w-full max-h-80 md:max-h-[95vh]"
                                            />
                                        </div>
                                        <div className="flex-grow md:w-1/3 p-4">
                                            <h3 className="text-lg font-bold">{selectedAd.title}</h3>
                                            <p className="text-sm">Posted by: {selectedAd.posted_by}</p>
                                            <p className="text-sm">Description: {selectedAd.description}</p>
                                            <p className="text-sm">Region: {selectedAd.region}</p>
                                            <p className="text-sm">Price: $5000</p>
                                            <p className="text-sm">Contact: {selectedAd.contact_info}</p>
                                            <form onSubmit={handleBidSubmit} className="mt-4 pt-4 flex">
                                                <input
                                                    type="number"
                                                    value={newBid}
                                                    onChange={handleBidChange}
                                                    className="border rounded p-2 mr-2"
                                                    placeholder="Enter Bid Amount"
                                                />
                                                <button type="submit" className="bg-pink-600 dark:bg-blue-600 text-white px-4 py-2 rounded-lg">Place Bid</button>
                                            </form>
                                        </div>
                                        <div className="flex-grow md:w-1/3 p-4">
                                            <h3 className="text-lg font-bold">Bids Placed</h3>
                                            <ul>
                                                {bids.map((bid, index) => (
                                                    <li key={index}>{bid.bidder}: ${bid.amount}</li>
                                                ))}
                                                <li>Bidder 1: $5100</li>
                                                <li>Bidder 2: $5200</li>
                                                <li>Bidder 3: $5300</li>
                                                <li>Bidder 4: $5400</li>
                                                <li>Bidder 5: $5500</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
    );
};

export default LiveAds;