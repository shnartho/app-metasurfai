const apiMapOld = require('./apiMapOld');
const apiMapNew = require('./apiMapNew');

// Use only one API map based on USE_NEW_API env
const useNewAPI = (process.env.USE_NEW_API) === 'true';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Support direct image upload with Content-Type image/jpeg or image/jpg
        const contentType = req.headers['content-type'] || '';
        if (contentType.startsWith('image/jpeg') || contentType.startsWith('image/jpg')) {
            const action = 'uploadImage';
            const token = req.headers['authorization'] || '';
            const mapping = useNewAPI ? apiMapNew[action] : apiMapOld[action];
            if (!mapping) {
                res.status(404).json({ error: `Unknown action: ${action}` });
                return;
            }
            const baseUrl = useNewAPI
                ? (process.env.NEW_API_URL)
                : (process.env.OLD_API_URL);
            const targetUrl = `${baseUrl}${mapping.endpoint}`;
            const headers = mapping.headers({}, token);
            const getRawBody = require('raw-body');
            let imageBuffer;
            try {
                imageBuffer = await getRawBody(req);
            } catch (err) {
                res.status(400).json({ error: 'Failed to read image data', details: String(err) });
                return;
            }
            const config = {
                method: mapping.method,
                headers: {
                    ...headers,
                    'Content-Type': contentType
                },
                body: imageBuffer
            };
            let response, respContentType, data;
            try {
                response = await fetch(targetUrl, config);
                respContentType = response.headers.get('content-type');
                if (respContentType && respContentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                res.status(response.status).json(data);
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                res.status(502).json({ error: 'Upstream fetch failed', details: String(fetchError) });
            }
            return;
        }

        // Default: JSON body logic
        if (!req.body || typeof req.body !== 'object') {
            res.status(400).json({ error: 'Missing or invalid JSON body. Please send a request with Content-Type: application/json and a valid JSON body.' });
            return;
        }
        const { action, token, __base, ...body } = req.body;
        // Use __base from frontend if provided, else fallback to global flag
        const base = __base || (useNewAPI ? 'new' : 'old');
        const mapping = base === 'new' ? apiMapNew[action] : apiMapOld[action];
        if (!mapping) {
            console.error('Unknown action:', action);
            res.status(404).json({ error: `Unknown action: ${action}` });
            return;
        }
        const baseUrl = base === 'new'
            ? process.env.API_NEW_URL
            : process.env.API_OLD_URL;
        const targetUrl = `${baseUrl}${mapping.endpoint}`;
        const method = mapping.method;
        const headers = mapping.headers(body, token);
        const config = { method, headers };
        const transformedBody = mapping.transform(body);
        if (method !== 'GET' && Object.keys(transformedBody).length > 0) {
            config.body = JSON.stringify(transformedBody);
        }
        let response, respContentType, data;
        try {
            response = await fetch(targetUrl, config);
            respContentType = response.headers.get('content-type');
            if (respContentType && respContentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            res.status(response.status).json(data);
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            res.status(502).json({ error: 'Upstream fetch failed', details: String(fetchError) });
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
}