import React from 'react';
import videos from '../../../public/TempVideos/Videos';

const Markets = () => {

    const handleMouseEnter = (event) => {
        const video = event.target;
        if (document.contains(video)) {
            video.play().catch(error => {
                console.error('Error attempting to play video:', error);
            });
            video.style.transform = 'scale(1.1)';
            video.style.zIndex = 1;
        }
    };

    const handleMouseLeave = (event) => {
        const video = event.target;
        if (document.contains(video)) {
            video.pause();
            video.style.transform = 'scale(1)';
            video.style.zIndex = 0;
        }
    };

    const handleClick = (event) => {
        const video = event.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    return (
        <div className="video-container pt-10">
            {videos.map((video, index) => (
                <div key={index} className="video-item" style={{ flex: '0 1 calc(33.333% - 20px)', position: 'relative', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
                    {video.live && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 2 }}>
                            Live
                        </div>
                    )}
                    <video
                        width="100%"
                        height="100%"
                        muted
                        loop
                        controls
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                        style={{ transition: 'transform 0.3s ease', zIndex: 1 }}
                    >
                        <source src={video.path} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div style={{ padding: '10px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{video.name}</h3>
                        {video.action && (
                            <button className="px-4 py-2 text-white border-none rounded bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-indigo-900 dark:to-blue-600">
                                {video.action}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Markets;