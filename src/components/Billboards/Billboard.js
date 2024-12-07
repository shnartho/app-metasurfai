import React, { useState, useEffect } from "react";

const Billboards = () => {
    const [Billboards, setBillboards] = useState([]);
    const [selectedBillboard, setSelectedBillboard] = useState(null);
    const [BillboardsPerPage, setBillboardsPerPage] = useState(9); // Default to 9 ads per page
    const [bids, setBids] = useState([]);
    const [newBid, setNewBid] = useState('');


    useEffect(() => {
        const fetchBillboards = async () => {
            try {
                const response = await fetch("https://metasurfai-public-api.fly.dev/v2/billboards");
                const data = await response.json();
                const sortedBillboards = data.sort((a, b) => b.token_reward - a.token_reward); // Sort by token_reward descending
                setBillboards(sortedBillboards);
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        fetchBillboards();
    }, []);

    useEffect(() => {
        const updateBillboardsPerPage = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setBillboardsPerPage(9); // 3x3 grid
            } else if (width >= 600) {
                setBillboardsPerPage(6); // 2x3 grid
            } else {
                setBillboardsPerPage(3); // 1x3 grid
            }
        };

        updateBillboardsPerPage();
        window.addEventListener("resize", updateBillboardsPerPage);
        return () => window.removeEventListener("resize", updateBillboardsPerPage);
    }, []);


    // Handle ad click
    const openModal = (Billboard) => {
        setSelectedBillboard(Billboard);
        setBids(Billboards.bids || []);
    };

    // Close modal
    const closeModal = () => {
            setSelectedBillboard(null);
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
    const getAspectRatioClass = (Billboard) => {
        const { width, height } = Billboard;
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
                         {Billboards.map((Billboard) => (
                                <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-sm dark:shadow-zinc-500 p-4 mb-4">
                                    <img
                                        className="object-cover w-full h-48 rounded-t-3xl"
                                        src={Billboard.image_url}
                                        alt={Billboard.title}
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold">{Billboard.title}</h3>
                                        <p className="text-sm">{Billboard.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <button onClick={() => openModal(Billboard)} className="bg-pink-600 dark:bg-blue-600 text-white px-4 py-2 rounded-lg">Start Bid</button>
                                            <p className="text-lg font-bold">Price: $5000</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedBillboard && (
                            <div className="p-4 fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border-2 border-opacity-40 border-pink-600 dark:border-blue-600 max-w-screen-lg w-full max-h-full md:max-h-[95vh] md:w-auto flex flex-col items-center justify-center overflow-y-auto">
                                    <span onClick={closeModal} className="absolute top-2 right-2 text-3xl font-bold cursor-pointer">
                                        &times;
                                    </span>
                                    <div className="flex flex-col md:flex-row w-full">
                                        <div className="flex-shrink-0 md:w-1/3 p-4">
                                            <img
                                                src={selectedBillboard.image_url}
                                                alt={selectedBillboard.title}
                                                className="object-contain max-w-full max-h-80 md:max-h-[95vh]"
                                            />
                                        </div>
                                        <div className="flex-grow md:w-1/3 p-4">
                                            <h3 className="text-lg font-bold">{selectedBillboard.title}</h3>
                                            <p className="text-sm">Posted by: {selectedBillboard.posted_by}</p>
                                            <p className="text-sm">Description: {selectedBillboard.description}</p>
                                            <p className="text-sm">Region: {selectedBillboard.region}</p>
                                            <p className="text-sm">Price: $5000</p>
                                            <p className="text-sm">Contact: {selectedBillboard.contact_info}</p>
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

export default Billboards;