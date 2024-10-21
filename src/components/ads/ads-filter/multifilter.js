import React, {useEffect, useState} from "react";

const Multifilter = () => {
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
        }else {
                setFilteredads([...ads]);
        }
    };
        
        
    const [selectedFilter, setSelectedFilter] = useState([]);
    const [filteredads, setFilteredads] = useState(ads);
    let filters = ['filter1', 'filter2', 'filter3', 'filter4', 'filter5'];

    const handleFilterClick = (selectedcategory) => {
        if (selectedFilter.includes(selectedcategory)) {
            let filters = selectedFilter.filter((f) => f !== selectedcategory);
            setSelectedFilter(filters);}
            else {
                setSelectedFilter([...selectedFilter, selectedcategory]);
            }
    }

    return (
        <div>
            <div className="buttons-container">
                {filters.map((category, index) => (
                    <button
                        key={`filters-${index}`}
                        onClick={() => handleFilterClick(category)}  
                        className={`buttono border-2 border-pink-600 dark:border-blue-600 ${selectedFilter.includes(category) ? 'active' : ''}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Multifilter;