// Always use the old API via the proxy endpoint
// apiCall(action, options)
// options: { body, token, headers, base: 'old' | 'new' }
// base lets a page explicitly force old or new regardless of global hybrid logic.
export const apiCall = async (action, { body = {}, token = '', headers = {}, base } = {}) => {
    try {
        let config;
        // Special handling for image uploads: send raw binary, not FormData
        if (body.file && (body.file instanceof File || body.file instanceof Blob)) {
            // Read the file as a Blob and send as raw binary
            const uploadHeaders = { ...headers };
            if (token && !uploadHeaders['Authorization']) {
                uploadHeaders['Authorization'] = `Bearer ${token.trim()}`;
            }
            if (!uploadHeaders['x-api-key']) {
                uploadHeaders['x-api-key'] = process.env.API_KEY || '';
            }
            // Set Content-Type to the file's MIME type (e.g., image/jpeg)
            if (body.file.type) {
                uploadHeaders['Content-Type'] = body.file.type;
            } else {
                uploadHeaders['Content-Type'] = 'application/octet-stream';
            }
            config = {
                method: 'PUT', // <-- CHANGE THIS FROM 'POST' TO 'PUT'
                headers: uploadHeaders,
                body: body.file
            };
        } else {
            config = {
                method: 'POST', // Proxy expects POST for all actions
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({
                    action,
                    token,
                    ...(base ? { __base: base } : {}),
                    ...body
                })
            };
        }
        const url = '/api/proxy';
        const response = await fetch(url, config);
        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }
        if (!response.ok) {
            console.log(data.error || data.message || data);
            throw new Error(
                data && (data.error || data.message)
                    ? data.error || data.message
                    : `Request failed with status ${response.status}`
            );
        }
        return data;
    } catch (error) {
        console.log(error);
        throw error instanceof Error ? error : new Error(String(error));
    }
};