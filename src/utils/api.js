const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const apiCall = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers = {}, useNewAPI = false } = options;
    
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        let url;
        
        if (IS_PRODUCTION) {
            url = '/api/proxy';
            config.body = JSON.stringify({
                endpoint,
                useNewAPI,
                ...body
            });
        } else {
            const baseUrl = useNewAPI 
                ? process.env.REACT_APP_NEW_API_BASE_URL 
                : process.env.REACT_APP_API_BASE_URL;
            url = `${baseUrl}${endpoint}`;
            if (body && method !== 'GET') {
                config.body = JSON.stringify(body);
            }
        }

        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(IS_PRODUCTION ? 'Request failed' : data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        if (IS_PRODUCTION) {
            throw new Error('Service temporarily unavailable. Please try again later.');
        } else {
            throw error;
        }
    }
};