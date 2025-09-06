import React from 'react';
import marketVideos from '../../../public/Market/Market';

const Markets = () => {

    const filteredVideos = marketVideos;

    const handleMouseEnter = (event) => {
        const video = event.target;
        if (document.contains(video)) {
            video.muted = false; // Ensure audio is unmuted
            video.play().catch(error => {
                console.error('Error attempting to play video:', error);
                // If autoplay with sound fails, try muted first then unmute
                video.muted = true;
                video.play().then(() => {
                    video.muted = false;
                }).catch(err => {
                    console.error('Error attempting to play muted video:', err);
                });
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
        <div className="market-video-container pt-10">
            {filteredVideos.map((video, index) => (
                <div key={index} className="market-video-item" style={{ 
                    flex: '0 1 calc(33.333% - 20px)', 
                    position: 'relative', 
                    border: '1px solid #ccc', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    aspectRatio: '9/16' // Mobile vertical aspect ratio
                }}>
                    {/* Watch Live Message */}
                    {video.watchMessage && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            color: '#00ff00', 
                            padding: '5px 10px', 
                            borderRadius: '15px', 
                            fontSize: '12px',
                            zIndex: 3 
                        }}>
                            {video.watchMessage}
                        </div>
                    )}
                    
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
                            gap: '5px'
                        }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                            Live • {video.viewers}
                        </div>
                    )}
                    
                    <video
                        width="100%"
                        height="100%"
                        loop
                        controls
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                        style={{ 
                            transition: 'transform 0.3s ease', 
                            zIndex: 1,
                            objectFit: 'cover' // Ensures video covers the container properly
                        }}
                    >
                        <source src={video.path} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                    {/* Floating Action Buttons */}
                    {video.buttons && (
                        <div style={{
                            position: 'absolute',
                            right: '0px', // Touch the right edge
                            top: '65%', // Moved down from 50% to 65%
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            zIndex: 3
                        }}>
                            {video.buttons.map((button, btnIndex) => (
                                <button
                                    key={btnIndex}
                                    className="buttonn"
                                    style={{
                                        padding: '12px 20px 12px 16px', // More padding, less on right
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        minWidth: '140px', // Bigger width
                                        textAlign: 'left', // Align text to left
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '1rem 0 0 1rem', // Rounded left, straight right
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.02s',
                                        boxShadow: '0 0px 7px -5px rgba(0, 0, 0, 0.5)',
                                        color: 'black',
                                        backgroundColor: button.type === 'usd' ? '#f0f9ff' : 
                                                       button.type === 'msai' ? '#fff7ed' : '#f0fdf4',
                                        height: '48px' // Fixed height for bigger buttons
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(0.97)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                    onClick={() => {
                                        if (button.type === 'whatsapp') {
                                            window.open('https://wa.me/your-number', '_blank');
                                        } else {
                                            console.log(`${button.text} clicked for ${video.name}`);
                                        }
                                    }}
                                >
                                    <span className="hoverEffect">
                                        <div></div>
                                    </span>
                                    <span style={{ 
                                        position: 'relative', 
                                        zIndex: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start' // Align content to left
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                            {button.text}
                                        </div>
                                        {button.price && (
                                            <div style={{ 
                                                fontSize: '10px', 
                                                marginTop: '2px',
                                                opacity: 0.8
                                            }}>
                                                {button.price}
                                            </div>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <div style={{ padding: '10px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{video.name}</h3>
                        {video.description && (
                            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                                {video.description}
                            </p>
                        )}
                        {video.action && (
                            <button className="buttonn px-4 py-2 text-white border-none">
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
    );
};

export default Markets;