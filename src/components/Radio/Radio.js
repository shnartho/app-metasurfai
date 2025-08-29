import React from 'react';
import RadioFrequencies from '../../../public/RadioPreview/RadioV';

const Radio = () => {


    return (
        <div className='pt-10'>
            <div className="px-4 ads-container flex-grow grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
                {RadioFrequencies.map((station, index) => (
                    <div key={index} className="rounded-3xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-sm dark:shadow-zinc-500 p-4 mb-4 relative">
                        <span className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded text-sm z-10">Radio</span>
                        {station.Path && station.Path.endsWith('.jpg') && (
                            <img src={station.Path} alt={station.title} className="w-full h-auto mb-2 rounded-lg" />
                        )}
                        {station.Path && station.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" autoPlay muted loop className="mb-2 rounded-lg">
                                <source src={station.Path} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        <div className="text-left">
                            <h3 className="text-lg font-bold my-2 dark:text-white">{station.name}</h3>
                            <p className="text-sm my-2 text-gray-700 dark:text-gray-300">{station.description}</p>
                            {station.action && (
                                <button className="buttonn px-4 py-2 text-white border-none rounded">
                                    <span className="hoverEffect">
                                        <div></div>
                                    </span>
                                    {station.action}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Radio;
