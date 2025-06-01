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
        <div className="w-full px-2">
            {/* Mobile: Wrap filters in multiple rows */}
            <div className="md:hidden">
                <div className="flex flex-wrap gap-2 justify-start">
                    {filters.map((category, index) => (
                        <button
                            key={`filters-mobile-${index}`}
                            onClick={() => handleFilterClick(category)}
                            className={`buttonf px-3 py-1 text-xs font-medium text-black dark:text-white hover:text-white border border-pink-600 dark:border-blue-600 hover:bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:hover:from-indigo-900 dark:hover:to-blue-600 rounded-full transition-all duration-200 ${
                                selectedFilter.includes(category)
                                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-indigo-900 dark:to-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop: Horizontal scroll */}
            <div className="hidden md:block">
                <div className={`buttons-container flex items-center ${
                    isSidebarOpen ? 'overflow-hidden' : 'overflow-x-auto'
                } gap-2 pb-2`}>
                    {filters.map((category, index) => (
                        <button
                            key={`filters-desktop-${index}`}
                            onClick={() => handleFilterClick(category)}
                            className={`buttonf whitespace-nowrap px-4 py-2 text-sm font-medium text-black dark:text-white hover:text-white border border-pink-600 dark:border-blue-600 hover:bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:hover:from-indigo-900 dark:hover:to-blue-600 rounded-full transition-all duration-200 ${
                                selectedFilter.includes(category)
                                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-indigo-900 dark:to-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800'
                            }`}
                        >
                            <div className="hoverEffect">
                                <div></div>
                            </div>
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Multifilter;