const apiMapOld = require('./apiMapOld');
const apiMapNew = require('./apiMapNew');

// Use only one API map based on USE_NEW_API env
const useNewAPI = (process.env.USE_NEW_API) === 'true';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Log all incoming requests for debugging
        console.log('[PROXY] Incoming request:', {
            method: req.method,
            url: req.url,
            headers: req.headers
        });

        // Try to log the raw body if possible (for POST/PUT),
        // but do NOT consume the stream for file uploads
        const contentType = req.headers['content-type'] || '';
        let skipRawBodyLog = false;
        if (
            contentType.startsWith('image/jpeg') ||
            contentType.startsWith('image/jpg')
            ) {
            // Log outgoing request details for debugging
            console.log('[PROXY] Preparing to forward image upload:', {
                method: useNewAPI ? apiMapNew['uploadImage'].method : apiMapOld['uploadImage'].method,
                url: (useNewAPI ? process.env.API_NEW_URL : process.env.API_OLD_URL) + (useNewAPI ? apiMapNew['uploadImage'].endpoint : apiMapOld['uploadImage'].endpoint),
                headers: req.headers,
                contentType: contentType
            });
            skipRawBodyLog = true;
        }
        if ((req.method === 'POST' || req.method === 'PUT') && !skipRawBodyLog) {
            let rawBody = '';
            try {
                req.on('data', chunk => { rawBody += chunk; });
                await new Promise(resolve => req.on('end', resolve));
                console.log('[PROXY] Raw body:', rawBody);
            } catch (e) {
                console.log('[PROXY] Could not read raw body:', e);
            }
        }
        // For file uploads, do not consume the stream for logging, only for getRawBody below

        // Support direct image upload with Content-Type image/jpeg, image/jpg, or multipart/form-data
        if (
            contentType.startsWith('image/jpeg') ||
            contentType.startsWith('image/jpg') ||
            contentType.startsWith('multipart/form-data')
        ) {
            // Accept file upload, do not expect JSON body
            // Only call getRawBody ONCE, do not consume stream for logging above
            const action = 'uploadImage';
            const token = (req.headers['authorization'] || '').trim();
            console.log('[PROXY] Incoming PUT image upload:');
            console.log('  Authorization header:', req.headers['authorization']);
            console.log('  Token (trimmed):', token);

            const mapping = useNewAPI ? apiMapNew[action] : apiMapOld[action];
            if (!mapping) {
                res.status(404).json({ error: `Unknown action: ${action}` });
                return;
            }
            const baseUrl = useNewAPI
                ? (process.env.API_NEW_URL)
                : (process.env.API_OLD_URL);
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
            // Print the outgoing Authorization header for debugging
            console.log('[PROXY] Outgoing request to backend:');
            console.log('  Authorization header:', config.headers['Authorization'] || config.headers['authorization']);
            console.log('  x-api-key:', config.headers['x-api-key']);
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

        // Only require JSON body for application/json requests
        if (contentType.startsWith('application/json')) {
            if (!req.body || typeof req.body !== 'object') {
                console.error('[PROXY] Invalid JSON body:', req.body);
                res.status(400).json({ error: 'Missing or invalid JSON body. Please send a request with Content-Type: application/json and a valid JSON body.' });
                return;
            }
        }
        const { action, token, __base, ...body } = req.body;
        console.log(`[PROXY] Incoming API call: action=`, action, 'base=', __base, 'body=', body);
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