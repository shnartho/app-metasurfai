import React, { useEffect, useRef } from 'react';
import './scriptAds.css';

/**
 * Component to display script-based ads that inject iframes
 * @param {Object} props
 * @param {Object} props.adData - The ad data
 * @param {Function} props.onLoad - Callback when ad loads
 */
const ScriptAd = ({ adData, onLoad }) => {
    const adContainerRef = useRef(null);
    
    useEffect(() => {
        if (!adContainerRef.current || !adData || !adData.script) return;
        
        try {
            // Clear any previous content
            adContainerRef.current.innerHTML = '';
            
            // Create a container for the ad to isolate it
            const adFrame = document.createElement('div');
            adFrame.className = 'script-ad-frame';
            adContainerRef.current.appendChild(adFrame);
            
            // Parse and extract the script content and attributes
            const scriptContent = adData.script;
            
            // Extract atOptions if available
            let atOptions = {};
            const atOptionsMatch = scriptContent.match(/atOptions\s*=\s*(\{[^}]+\})/);
            if (atOptionsMatch && atOptionsMatch[1]) {
                try {
                    // Convert the string to actual JavaScript object
                    // This is safer than using eval
                    const cleanedJson = atOptionsMatch[1]
                        .replace(/'/g, '"')               // Replace single quotes with double quotes
                        .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')  // Add quotes to keys
                        .replace(/:\s*([^",\s{}]+)/g, ':"$1"'); // Add quotes to values
                    
                    atOptions = JSON.parse(cleanedJson);
                } catch (err) {
                    console.error("Failed to parse atOptions:", err);
                }
            }
            
            // Extract script src if available
            let scriptSrc = '';
            const srcMatch = scriptContent.match(/src\s*=\s*["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                scriptSrc = srcMatch[1];
            }
            
            // Create a container with the exact dimensions
            adFrame.style.width = atOptions.width ? `${atOptions.width}px` : '300px';
            adFrame.style.height = atOptions.height ? `${atOptions.height}px` : '250px';
            
            // Method 1: Use iframe approach for better isolation
            if (scriptSrc) {
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.title = adData.title || 'Advertisement';
                iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';
                adFrame.appendChild(iframe);
                
                // Create the HTML content for the iframe
                const iframeContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <script type="text/javascript">
                            ${atOptions ? `atOptions = ${JSON.stringify(atOptions)};` : ''}
                        </script>
                        <script type="text/javascript" src="${scriptSrc}"></script>
                        <style>
                            body, html { margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; }
                        </style>
                    </head>
                    <body>
                        <div id="ad-container"></div>
                    </body>
                    </html>
                `;
                
                // Set the content of the iframe
                iframe.onload = () => {
                    if (onLoad) onLoad();
                };
                
                // Write to the iframe
                iframe.srcdoc = iframeContent;
            } 
            // Fallback method - less isolation but simpler
            else {
                // Insert the script directly
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.text = `
                    atOptions = ${JSON.stringify(atOptions)};
                `;
                adFrame.appendChild(scriptElement);
                
                if (scriptSrc) {
                    const srcScript = document.createElement('script');
                    srcScript.type = 'text/javascript';
                    srcScript.src = scriptSrc;
                    srcScript.onload = () => {
                        if (onLoad) onLoad();
                    };
                    adFrame.appendChild(srcScript);
                }
            }
        } catch (error) {
            console.error("Error rendering script ad:", error);
            // Create a fallback display
            adContainerRef.current.innerHTML = `
                <div class="ad-error">
                    <p>Ad could not be loaded</p>
                </div>
            `;
        }
        
        return () => {
            // Cleanup on unmount
            if (adContainerRef.current) {
                adContainerRef.current.innerHTML = '';
            }
        };
    }, [adData, onLoad]);
    
    return (
        <div 
            ref={adContainerRef} 
            className="script-ad-container"
            style={{
                width: '100%',
                height: '100%',
                minHeight: '250px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            <div className="loading-ad">Loading advertisement...</div>
        </div>
    );
};

export default ScriptAd;
