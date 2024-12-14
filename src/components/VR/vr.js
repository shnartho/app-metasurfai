import React from 'react';
import VRV from '../../../public/VRVids/VRVIDS';
const VR = () => {

    return (
        <div className='pt-10' style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className="vr-games-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {VRV.map((game, index) => (
                    <div key={index} className="vr-game-item" style={{ flex: '0 1 calc(33.333% - 20px)', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden', textAlign: 'left', padding: '20px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{game.title}</h2>
                        <p style={{ marginBottom: '10px' }}>{game.description}</p>
                        {game.Path && game.Path.endsWith('.jpg') && <img src={game.Path} alt={game.title} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />}
                        {game.Path && game.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" controls style={{ marginBottom: '10px' }}>
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

