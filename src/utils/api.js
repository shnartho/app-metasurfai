// Always use the old API via the proxy endpoint
// apiCall(action, options)
// options: { body, token, headers, base: 'old' | 'new' }
// base lets a page explicitly force old or new regardless of global hybrid logic.

/* ─── Token Refresh Manager ─────────────────────────────────────────── */
let _refreshPromise = null;

export const tokenManager = {
    /** Refresh tokens using the stored refreshToken. Returns new idToken or null. */
    async refreshTokens() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        // De-duplicate concurrent refresh calls
        if (_refreshPromise) return _refreshPromise;

        _refreshPromise = (async () => {
            try {
                const data = await apiCall('refreshToken', {
                    body: { refreshToken },
                    base: 'new',
                    _skipRefresh: true // prevent infinite loop
                });
                if (data.idToken) {
                    localStorage.setItem('authToken', data.idToken);
                    localStorage.setItem('accessToken', data.accessToken);
                    // refreshToken stays the same (Cognito doesn't rotate it)
                    window.dispatchEvent(new Event('tokenRefreshed'));
                    return data.idToken;
                }
                return null;
            } catch (err) {
                console.warn('[tokenManager] Refresh failed:', err);
                return null;
            } finally {
                _refreshPromise = null;
            }
        })();

        return _refreshPromise;
    },

    /** Check if a JWT is expired (with 60-second buffer). */
    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return (payload.exp * 1000) < (Date.now() - 60_000);
        } catch { return true; }
    },

    /** Get a valid auth token, refreshing if needed. */
    async getValidToken() {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        if (!this.isTokenExpired(token)) return token;
        return this.refreshTokens();
    },

    /** Force logout — clear all tokens and reload. */
    forceLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        window.dispatchEvent(new Event('forceLogout'));
        window.location.reload();
    }
};

/**
 * Decode a Cognito ID-token (JWT) and return a profile-shaped object.
 * Works client-side — no secret needed (signature is verified server-side).
 */
export const decodeIdToken = (idToken) => {
    try {
        const payload = idToken.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name || '',
            address: decoded.address || '',
            role: decoded.profile || 'user',
            email_verified: decoded.email_verified || false,
        };
    } catch (e) {
        console.error('[decodeIdToken] Failed to decode token:', e);
        return null;
    }
};

export const apiCall = async (action, { body = {}, token = '', headers = {}, base, _skipRefresh = false } = {}) => {
    try {
        // Auto-refresh expired token before making an authenticated request
        const isNewApi = (process.env.NEXT_PUBLIC_USE_NEW_API === 'true');
        if (isNewApi && token && !_skipRefresh && tokenManager.isTokenExpired(token)) {
            const refreshed = await tokenManager.refreshTokens();
            if (refreshed) {
                token = refreshed;
            } else {
                // Refresh failed – force re-login
                tokenManager.forceLogout();
                throw new Error('Session expired. Please log in again.');
            }
        }

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