import React, { useEffect, useRef } from 'react';

/**
 * Component to display script-based ads
 * @param {Object} props
 * @param {Object} props.adData - The ad data containing the script
 * @param {boolean} props.inModal - Whether the ad is displayed in a modal
 * @param {Function} props.onLoad - Callback when ad loads (optional)
 */
const ScriptAd = ({ adData, inModal = false, onLoad }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !adData || !adData.script) return;

        // Clear any existing content
        containerRef.current.innerHTML = '';

        // Create a container div for the script
        const scriptContainer = document.createElement('div');
        scriptContainer.innerHTML = adData.script;
        
        // Append to our container
        containerRef.current.appendChild(scriptContainer);

        // Call onLoad callback if provided
        if (onLoad && typeof onLoad === 'function') {
            // Add a small delay to ensure the ad has time to initialize
            setTimeout(() => {
                onLoad();
            }, 500);
        }

        // Cleanup function
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [adData, onLoad]);

    return (
        <div 
            ref={containerRef}
            className="script-ad-wrapper"
            style={{
                width: inModal ? '300px' : '100%',
                height: inModal ? '250px' : '250px',
                margin: inModal ? '0 auto' : '0',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* Fallback content while loading */}
            <div style={{ 
                color: '#666', 
                fontSize: '14px',
                textAlign: 'center',
                padding: '20px'
            }}>
                Loading advertisement...
            </div>
        </div>
    );
};

export default ScriptAd;
