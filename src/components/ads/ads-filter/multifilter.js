import React, { useEffect, useState } from "react";
import filterlist from "./filterlist";

const Multifilter = ({ isSidebarOpen }) => {
    const ads = [];
    useEffect(() => {
        filtersitems();
    }, [selectedFilter]);

    const filtersitems = () => {
        if (selectedFilter.length > 0) {
            let filteredAds = selectedFilter.map((selectedcategory) => {
                let tempAds = ads.filter((ad) => ad.category === selectedcategory);
                return tempAds;
            });
            setFilteredads(filteredAds.flat());
        } else {
            setFilteredads([...ads]);
        }
    };

    const [selectedFilter, setSelectedFilter] = useState([]);
    const [filteredads, setFilteredads] = useState(ads);
    let filters = filterlist;

    const handleFilterClick = (selectedcategory) => {
        if (selectedFilter.includes(selectedcategory)) {
            let filters = selectedFilter.filter((f) => f !== selectedcategory);
            setSelectedFilter(filters);
        } else {
            setSelectedFilter([...selectedFilter, selectedcategory]);
        }
    };

    return (
        <div>
            <div className={`buttons-container flex items-center ${isSidebarOpen ? 'overflow-hidden' : 'overflow-x-scroll'} whitespace-nowrap scroll-snap-type-x mandatory`}>
                {filters.map((category, index) => (
                    <button
                        key={`filters-${index}`}
                        onClick={() => handleFilterClick(category)}
                        className={`buttonf mt-1 mx-1 text-black dark:text-white hover:text-white border-pink-600 dark:border-blue-600 hover:bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:hover:from-indigo-900 dark:hover:to-blue-600 ${selectedFilter.includes(category) ? 'active' : ''} scroll-snap-align-start`}
                    >
                        <div className="hoverEffect">
                        <div></div>
                        </div>
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Multifilter;