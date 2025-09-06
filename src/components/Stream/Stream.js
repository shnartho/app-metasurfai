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
                💰 Watch Videos to Get Paid!!💰😃
            </div>
            
            <div className="video-container pt-4">
                {videos.map((video, index) => (
                    <div key={index} className="video-item" style={{ 
                        flex: '0 1 calc(33.333% - 20px)', 
                        position: 'relative', 
                        border: '1px solid #ccc', 
                        borderRadius: '10px', 
                        overflow: 'hidden',
                        aspectRatio: '9/16' // Mobile vertical aspect ratio
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
                        
                        {/* Advertisement Button */}
                        <div style={{
                            position: 'absolute',
                            bottom: '60px', // Above the video title
                            left: '10px',
                            right: '10px',
                            zIndex: 3
                        }}>
                            <button
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
                        
                        <div style={{ padding: '10px', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '16px', margin: '5px 0', fontWeight: 'bold' }}>{video.name}</h3>
                            {video.description && (
                                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0', lineHeight: '1.3' }}>
                                    {video.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stream;