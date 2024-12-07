import React from 'react';
import videos from '../../../public/TempVideos/Videos';

const Stream = () => {

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

    const handleClick = ({ target: video }) => {
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
        <div className="videos-container pt-10" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            {videos.map((video, index) => (
                <div key={index} className="video-item" style={{ flex: '0 1 calc(33.333% - 20px)', position: 'relative', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 2 }}>Live</span>
                    <video
                        width="100%"
                        height="100%"
                        muted
                        autoPlay
                        loop
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
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Stream;