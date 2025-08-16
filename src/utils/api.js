// Always use the old API via the proxy endpoint
// apiCall(action, options)
// options: { body, token, headers, base: 'old' | 'new' }
// base lets a page explicitly force old or new regardless of global hybrid logic.
export const apiCall = async (action, { body = {}, token = '', headers = {}, base } = {}) => {
    try {
        let config;
        // Special handling for file uploads
        if (body.file && (body.file instanceof File || body.file instanceof Blob)) {
            const formData = new FormData();
            formData.append('file', body.file, body.file.name);
            // Add any extra fields if needed
            if (body.fileName) formData.append('fileName', body.fileName);
            if (body.contentType) formData.append('contentType', body.contentType);
            // Add Authorization header if token is present
            const uploadHeaders = { ...headers };
            if (token && !uploadHeaders['Authorization']) {
                uploadHeaders['Authorization'] = `Bearer ${token}`;
            }
            config = {
                method: 'POST',
                headers: uploadHeaders, // Let browser set Content-Type for FormData
                body: formData
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