import React from 'react';
import videos from '../../../public/TempVideos/Videos';

const Videos = () => {

    const handleMouseEnter = (event) => {
        const video = event.target;
        if (document.contains(video)) {
            video.style.transform = 'scale(1.1)';
            video.style.zIndex = 1;
        }
    };

    const handleMouseLeave = (event) => {
        const video = event.target;
        if (document.contains(video)) {
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
    const handleFullScreen = (event) => {
        const video = event.target;
        if (document.contains(video)) {
        const requestFullscreen = 
            video.requestFullscreen || 
            video.mozRequestFullScreen || 
            video.webkitRequestFullscreen || 
            video.msRequestFullscreen;

        requestFullscreen?.call(video);
    }
};

return (
    <div className="video-container pt-10">
        {videos.map((video, index) => (
            <div key={index} className="video-item" style={{ flex: '0 1 calc(33.333% - 20px)', position: 'relative', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
                <video
                    width="100%"
                    height="100%"
                    controls
                    onClick={handleClick}
                    onDoubleClick={handleFullScreen}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{ transition: 'transform 0.3s ease', zIndex: 1 }}
                >
                    <source src={video.path} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        ))}
    </div>
);
};

export default Videos;