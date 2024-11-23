import React, { useState, useEffect } from "react";

const SideNav = () => {

    return(
        <>
            <a href="" className='items text-black dark:text-white font-Oxanium space-x-4 px-2 pt-2'>Explore</a>
            <a href="" className='items text-black dark:text-white font-Oxanium space-x-4 px-2 pt-2' onClick={() => navigate('live')}>Live</a>
            <a href="" className='items text-black dark:text-white font-Oxanium space-x-4 px-2 pt-2 pl-5' onClick={() => navigate('Dashboard')}>Dashboard</a>
        </>
    );
}

export default SideNav;