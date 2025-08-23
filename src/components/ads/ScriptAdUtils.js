/**
 * Utility functions for creating and managing script-based ads
 */

/**
 * Creates a set of script-based ads to be added to the regular ad array
 * @param {number} count - Number of script ads to create
 * @returns {Array} Array of script ad objects
 */
export const generateScriptAds = (count = 3) => {
    const scriptAdTemplate = `<script type="text/javascript">
    atOptions = {
        'key' : '1b8a0dcbc010cae9ecd999e98b6f9809',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
    };
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/1b8a0dcbc010cae9ecd999e98b6f9809/invoke.js"></script>`;

    // Generate multiple script ads with different IDs but same script content
    return Array(count).fill().map((_, index) => {
        // Create different ad titles and descriptions for variety
        const adTypes = [
            {
                title: "Premium Interactive Ad",
                description: "Sponsored interactive content with rewards"
            },
            {
                title: "Featured Sponsor Content",
                description: "Special partner advertisement with bonus rewards"
            },
            {
                title: "Promotional Showcase",
                description: "Exclusive promotional content from our sponsors"
            }
        ];
        
        // Use the predefined ad content or fallback if index is out of bounds
        const adContent = index < adTypes.length 
            ? adTypes[index] 
            : { title: `Script Ad ${index + 1}`, description: 'Sponsored advertisement with rewards' };
            
        return {
            id: `script-ad-${Date.now()}-${index}`,
            _id: `script-ad-${Date.now()}-${index}`,
            title: adContent.title,
            description: adContent.description,
            type: 'script',
            script: scriptAdTemplate,
            image_url: 'https://via.placeholder.com/300x250?text=Interactive+Ad',
            token_reward: 0.5 + (Math.random() * 0.5), // Random reward between 0.5 and 1.0
            region: 'Global',
            posted_by: 'Advertising Network',
            view_count: Math.floor(Math.random() * 1000), // Random view count
            budget: 1000,
            reward_per_view: 0.5
        };
    });
};

/**
 * Adds script ads to the existing ad array
 * @param {Array} existingAds - Existing ads array
 * @param {number} count - Number of script ads to add
 * @returns {Array} Combined array with script ads included
 */
export const addScriptAdsToExistingAds = (existingAds = [], count = 3) => {
    const scriptAds = generateScriptAds(count);
    
    // Combine arrays, using spread to avoid mutating the original
    const combinedAds = [...existingAds, ...scriptAds];
    
    // Sort by reward_per_view as in the original code
    return combinedAds.sort((a, b) => b.reward_per_view - a.reward_per_view);
};
