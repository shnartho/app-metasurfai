import React, { useEffect, useState } from "react";
import filterlist from "./filterlist";

const Multifilter = ({ isSidebarOpen }) => {
    const ads = [];
    const [selectedFilter, setSelectedFilter] = useState([]);
    const [filteredads, setFilteredads] = useState(ads);
    const [showAllFilters, setShowAllFilters] = useState(false);
    let filters = filterlist;

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

    const handleFilterClick = (selectedcategory) => {
        if (selectedFilter.includes(selectedcategory)) {
            let filters = selectedFilter.filter((f) => f !== selectedcategory);
            setSelectedFilter(filters);
        } else {
            setSelectedFilter([...selectedFilter, selectedcategory]);
        }
    };

    // For mobile, show only first 5 filters initially
    const displayFilters = showAllFilters ? filters : filters.slice(0, 5);

    return (
        <div className="w-full px-2">
            {/* Mobile: YouTube-style horizontal scroll with expand button */}
            <div className="md:hidden">
                <div className="flex items-center gap-2 pb-2 overflow-hidden">
                    {/* Filter chips */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                        {displayFilters.map((category, index) => (
                            <button
                                key={`filters-mobile-${index}`}
                                onClick={() => handleFilterClick(category)}
                                className={`buttonf flex-shrink-0 px-3 py-1.5 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-full transition-all duration-200 whitespace-nowrap ${
                                    selectedFilter.includes(category)
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    {/* Expand/Collapse button */}
                    {filters.length > 5 && (
                        <button
                            onClick={() => setShowAllFilters(!showAllFilters)}
                            className="flex-shrink-0 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            <svg 
                                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showAllFilters ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                </div>
                
                {/* Expanded filters grid for mobile */}
                {showAllFilters && (
                    <div className="mt-2 grid grid-cols-2 gap-2 animate-slideDown">
                        {filters.slice(5).map((category, index) => (
                            <button
                                key={`filters-mobile-expanded-${index}`}
                                onClick={() => handleFilterClick(category)}
                                className={`buttonf px-3 py-2 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 ${
                                    selectedFilter.includes(category)
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop: Horizontal scroll */}
            <div className="hidden md:block">
                <div className={`buttons-container flex items-center ${
                    isSidebarOpen ? 'overflow-hidden' : 'overflow-x-auto'
                } gap-3 pb-2`}>
                    {filters.map((category, index) => (
                        <button
                            key={`filters-desktop-${index}`}
                            onClick={() => handleFilterClick(category)}
                            className={`buttonf whitespace-nowrap px-4 py-2 text-sm font-medium text-black dark:text-white hover:text-white border border-pink-600 dark:border-blue-600 hover:bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:hover:from-indigo-900 dark:hover:to-blue-600 rounded-full transition-all duration-300 transform hover:scale-105 ${
                                selectedFilter.includes(category)
                                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-indigo-900 dark:to-blue-600 text-white scale-105'
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

            {/* Active filters indicator */}
            {selectedFilter.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Active filters:
                    </span>
                    <div className="flex gap-1 overflow-x-auto">
                        {selectedFilter.map((filter, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-pink-100 dark:bg-blue-900 text-pink-800 dark:text-blue-200 rounded-full"
                            >
                                {filter}
                                <button
                                    onClick={() => handleFilterClick(filter)}
                                    className="ml-1 hover:text-pink-600 dark:hover:text-blue-400"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Multifilter;