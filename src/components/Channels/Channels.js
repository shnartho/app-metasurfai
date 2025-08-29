import React from 'react';
import ChannelsToC from '../../../public/ChannelsPreview/ChannelsV';
const Channels = () => {

    const handlePostAdClick = () => {
        alert('Advertisers can post ads that will instantly send mobile notifications to all users.');
    };

    return (
        <div className='pt-10'>
            <div className="px-4 ads-container flex-grow grid gap-4 overflow-y-auto" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))` }}>
                {ChannelsToC.map((video, index) => (
                    <div key={index} className="rounded-3xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-sm dark:shadow-zinc-500 p-4 mb-4 relative">
                        <span className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded text-sm z-10">Channels</span>
                        {video.Path && video.Path.endsWith('.jpg') && (
                            <img src={video.Path} alt={video.title} className="w-full h-auto mb-2 rounded-lg" />
                        )}
                        {video.Path && video.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" controls className="mb-2 rounded-lg">
                                <source src={video.Path} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        <div className="text-left">
                            <h3 className="text-lg font-bold my-2 dark:text-white">{video.name}</h3>
                            {video.action && (
                                <button onClick={handlePostAdClick} className="buttonn px-4 py-2 text-white border-none rounded">
                                    <span className="hoverEffect">
                                        <div></div>
                                    </span>
                                    {video.action}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Channels;