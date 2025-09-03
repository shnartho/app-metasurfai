import React from 'react';
import VRV from '../../../public/VRVids/VRVIDS';
const VR = () => {

    return (
        <div className='pt-10'>
            <div className="px-4 w-full flex flex-wrap gap-6 justify-center items-stretch">
                {VRV.map((game, index) => (
                    <div key={index} className="rounded-3xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-sm dark:shadow-zinc-500 p-4 mb-4" style={{flex: '0 1 calc(33.333% - 32px)', minWidth: 280, maxWidth: 420}}>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">{game.title}</h2>
                        <p className="mb-2 text-gray-700 dark:text-gray-300">{game.description}</p>
                        {game.Path && game.Path.endsWith('.jpg') && (
                            <img src={game.Path} alt={game.title} className="w-full h-auto mb-2 rounded-lg" />
                        )}
                        {game.Path && game.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" controls className="mb-2 rounded-lg">
                                <source src={game.Path} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VR;

