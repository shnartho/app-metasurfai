export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { endpoint, useNewAPI, ...body } = req.body;
        
        const baseUrl = useNewAPI 
            ? process.env.NEW_API_BASE_URL 
            : process.env.API_BASE_URL;
            
        const targetUrl = `${baseUrl}${endpoint}`;
        
        const config = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            }
        };

        if (req.method !== 'GET' && Object.keys(body).length > 0) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(targetUrl, config);
        const data = await response.json();
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}