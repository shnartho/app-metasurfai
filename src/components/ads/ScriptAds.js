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
            const atOptionsMatch = scriptContent.match(/atOptions\s*=\s*(\{[^;]+\});/);
            if (atOptionsMatch && atOptionsMatch[1]) {
                try {
                    // Instead of trying to parse JSON directly, create a Function that returns the object
                    // This is safer than eval but still allows proper parsing of JavaScript object notation
                    const objectFunction = new Function(`return ${atOptionsMatch[1]}`);
                    atOptions = objectFunction();
                } catch (err) {
                    console.error("Failed to parse atOptions:", err);
                    // Fallback to manual extraction of key parameters
                    try {
                        const keyMatch = scriptContent.match(/'key'\s*:\s*'([^']+)'/);
                        const formatMatch = scriptContent.match(/'format'\s*:\s*'([^']+)'/);
                        const heightMatch = scriptContent.match(/'height'\s*:\s*(\d+)/);
                        const widthMatch = scriptContent.match(/'width'\s*:\s*(\d+)/);
                        
                        atOptions = {
                            key: keyMatch ? keyMatch[1] : '1b8a0dcbc010cae9ecd999e98b6f9809',
                            format: formatMatch ? formatMatch[1] : 'iframe',
                            height: heightMatch ? parseInt(heightMatch[1]) : 250,
                            width: widthMatch ? parseInt(widthMatch[1]) : 300,
                            params: {}
                        };
                    } catch (fallbackErr) {
                        console.error("Fallback extraction failed:", fallbackErr);
                        // Use hardcoded defaults as last resort
                        atOptions = {
                            key: '1b8a0dcbc010cae9ecd999e98b6f9809',
                            format: 'iframe',
                            height: 250,
                            width: 300,
                            params: {}
                        };
                    }
                }
            }
            
            // Extract script src if available
            let scriptSrc = '';
            const srcMatch = scriptContent.match(/src\s*=\s*["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                scriptSrc = srcMatch[1];
                // Ensure the URL has proper protocol
                if (scriptSrc.startsWith('//')) {
                    scriptSrc = `https:${scriptSrc}`;
                }
            }
            
            // Create a container with the exact dimensions
            adFrame.style.width = atOptions.width ? `${atOptions.width}px` : '300px';
            adFrame.style.height = atOptions.height ? `${atOptions.height}px` : '250px';
            adFrame.style.margin = '0 auto';
            adFrame.style.backgroundColor = '#ffffff';
            adFrame.style.border = '1px solid #e0e0e0';
            adFrame.style.borderRadius = '4px';
            adFrame.style.overflow = 'hidden';
            adFrame.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            
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
                            ${scriptContent.includes('atOptions') ? scriptContent.split('<script type="text/javascript">')[1].split('</script>')[0].trim() : `
                            atOptions = {
                                'key' : '1b8a0dcbc010cae9ecd999e98b6f9809',
                                'format' : 'iframe',
                                'height' : ${atOptions.height || 250},
                                'width' : ${atOptions.width || 300},
                                'params' : {}
                            };`}
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
                // Insert the original script directly
                const scriptDiv = document.createElement('div');
                scriptDiv.innerHTML = scriptContent;
                
                // Extract and append all script elements
                const scriptElements = scriptDiv.querySelectorAll('script');
                scriptElements.forEach(originalScript => {
                    // For src scripts
                    if (originalScript.src) {
                        const newScript = document.createElement('script');
                        newScript.type = 'text/javascript';
                        newScript.src = originalScript.src;
                        newScript.onload = () => {
                            if (onLoad) onLoad();
                        };
                        adFrame.appendChild(newScript);
                    } 
                    // For inline scripts
                    else if (originalScript.textContent) {
                        const newScript = document.createElement('script');
                        newScript.type = 'text/javascript';
                        newScript.textContent = originalScript.textContent;
                        adFrame.appendChild(newScript);
                    }
                });
                
                // If no script elements were found, try a different approach
                if (scriptElements.length === 0 && scriptSrc) {
                    // Create a direct script element for the src
                    const directScript = document.createElement('script');
                    directScript.type = 'text/javascript';
                    directScript.src = scriptSrc;
                    directScript.onload = () => {
                        if (onLoad) onLoad();
                    };
                    
                    // Add any atOptions first if needed
                    if (scriptContent.includes('atOptions')) {
                        const optionsScript = document.createElement('script');
                        optionsScript.type = 'text/javascript';
                        optionsScript.textContent = scriptContent.split('<script type="text/javascript">')[1].split('</script>')[0].trim();
                        adFrame.appendChild(optionsScript);
                    }
                    
                    adFrame.appendChild(directScript);
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
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            <div className="loading-ad">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 mb-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading advertisement...
                </div>
            </div>
        </div>
    );
};

export default ScriptAd;
