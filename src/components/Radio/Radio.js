import React from 'react';
import RadioFrequencies from '../../../public/RadioPreview/RadioV';

const Radio = () => {


    return (
        <div className='pt-10' style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className="radio-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                {RadioFrequencies.map((station, index) => (
                    <div key={index} className="station-item" style={{ flex: '0 1 calc(33.333% - 20px)', position: 'relative', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'grey', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 2 }}>Radio</span>
                        {station.Path && station.Path.endsWith('.jpg') && <img src={station.Path} alt={station.title} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />}
                        {station.Path && station.Path.endsWith('.mp4') && (
                            <video width="100%" height="auto" autoPlay muted loop style={{ marginBottom: '10px' }}>
                                <source src={station.Path} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        <div style={{ padding: '10px', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{station.name}</h3>
                            <p style={{ fontSize: '14px', margin: '10px 0' }}>{station.description}</p>
                            {station.action && (
                                <button className="buttonn px-4 py-2 text-white border-none rounded ">
                                <span className="hoverEffect">
                                <div></div>
                                </span>
                                    {station.action}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Radio;
