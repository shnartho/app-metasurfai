import React from 'react';
import videos from '../../../public/TempVideos/Videos';

const Live = () => {

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

    const getPlatformLogo = (platform) => {
        const logoStyle = {
            width: '20px',
            height: '20px',
            borderRadius: '4px'
        };
        
        switch(platform) {
            case 'youtube':
                return <div style={{...logoStyle, backgroundColor: '#FF0000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'}}>YT</div>;
            case 'twitch':
                return <div style={{...logoStyle, backgroundColor: '#9146FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold'}}>TW</div>;
            case 'kick':
                return <div style={{...logoStyle, backgroundColor: '#53FC18', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold'}}>KICK</div>;
            default:
                return <div style={{...logoStyle, backgroundColor: '#666', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>LIVE</div>;
        }
    };

    return (
        <div className="stream-container">
            {/* Top Message */}
            <div style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 20px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                💰 Watch Videos to Get Paid! 😃
            </div>
            
            <div className="video-container pt-4">
                {videos.map((video, index) => (
                    <div key={index} className="video-item" style={{ 
                        // Removed flex properties, using CSS Grid instead
                        position: 'relative', 
                        border: '1px solid #ccc', 
                        borderRadius: '10px', 
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '100%', // Ensure it doesn't overflow
                        overflow: 'hidden' // Prevent content overflow
                    }}>
                        {/* Video Container with fixed aspect ratio */}
                        <div style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            width: '100%',
                            overflow: 'hidden', // Keep overflow hidden only for the video container
                            borderRadius: '10px 10px 0 0' // Round only top corners
                        }}>
                        {/* Platform Logo */}
                        <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {getPlatformLogo(video.platform)}
                        </div>
                        
                        {/* Live Tag with Viewers */}
                        {video.live && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                left: '10px', 
                                backgroundColor: 'red', 
                                color: 'white', 
                                padding: '5px 10px', 
                                borderRadius: '5px', 
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                                LIVE • {video.viewers}
                            </div>
                        )}
                        
                        {/* Not Live but showing viewer count */}
                        {!video.live && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                left: '10px', 
                                backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                                color: 'white', 
                                padding: '5px 10px', 
                                borderRadius: '5px', 
                                zIndex: 3,
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                👥 {video.viewers} viewers
                            </div>
                        )}
                        
                        <video
                            width="100%"
                            height="100%"
                            muted
                            autoPlay
                            loop
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleClick}
                            style={{ 
                                transition: 'transform 0.3s ease', 
                                zIndex: 1,
                                objectFit: 'cover'
                            }}
                        >
                            <source src={video.path} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        </div>
                        
                        <div style={{ 
                            padding: '8px', // Reduced padding
                            textAlign: 'left',
                            backgroundColor: 'white',
                            borderRadius: '0 0 10px 10px', // Round only bottom corners
                            minHeight: '100px' // Reduced minimum height
                        }}>
                            <h3 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 'bold', color: '#333' }}>{video.name}</h3>
                            {video.description && (
                                <p style={{ fontSize: '11px', color: '#666', margin: '4px 0', lineHeight: '1.3' }}>
                                    {video.description}
                                </p>
                            )}
                            
                            {/* Advertisement Button - Now below the video */}
                            <button
                                style={{
                                    width: '100%',
                                    padding: '8px 12px', // Reduced padding
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '11px', // Smaller font
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    marginTop: '8px' // Reduced margin
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#d97706';
                                    e.target.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#f59e0b';
                                    e.target.style.transform = 'scale(1)';
                                }}
                                onClick={() => {
                                    console.log(`Advertisement placement requested for ${video.name}`);
                                    // Handle advertisement placement logic here
                                }}
                            >
                                📺 Put Your Advertisement in This Live Video
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Live;