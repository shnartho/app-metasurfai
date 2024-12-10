import React from 'react';
import ChannelsToC from '../../../public/ChannelsPreview/ChannelsV';
const Channels = () => {

    const handlePostAdClick = () => {
        alert('Advertisers can post ads that will instantly send mobile notifications to all users.');
    };

    return (
        <div className='pt-10' style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className="channels-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {ChannelsToC.map((video, index) => (
                  <div key={index} className="video-item" style={{ flex: '0 1 calc(33.333% - 20px)', position: 'relative', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'grey', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 2 }}>Channels</span>
                  {video.Path && video.Path.endsWith('.jpg') && <img src={video.Path} alt={video.title} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />}
                        {video.Path && video.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" controls style={{ marginBottom: '10px' }}>
                                <source src={video.Path} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                  <div style={{ padding: '10px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{video.name}</h3>
                        {video.action && (
                            <button onClick={handlePostAdClick} className="px-4 py-2 text-white border-none rounded bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-indigo-900 dark:to-blue-600">
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