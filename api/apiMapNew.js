
// Consolidated (no duplicates) new API map.
// NEW API ALWAYS REQUIRES an API key: set API_KEY (preferred) or X_API_KEY / NEW_API_KEY (legacy) in env.
const API_KEY = process.env.API_KEY || ''
// Warn if missing but don't prevent loading
if (!API_KEY) {
    console.warn('[apiMapNew] API_KEY environment variable is not set. Some API calls may fail.');
}

const apiMapNew = {
    // ─── Health / Status ─────────────────────────────────────────────
    status: {
        base: 'new',
        endpoint: '/',
        method: 'GET',
        headers: () => ({ 'x-api-key': API_KEY }),
        transform: () => ({})
    },

    // ─── Auth (Cognito - AWS Backend) ───────────────────────────────
    signup: {
        base: 'new',
        endpoint: '/signup',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({
            email: body.email,
            password: body.password,
            name: body.name || undefined,
            address: body.address || undefined
        })
    },

    login: {
        base: 'new',
        endpoint: '/login',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ email: body.email, password: body.password })
    },

    logout: {
        base: 'new',
        endpoint: '/logout',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }),
        transform: () => ({})
    },

    refreshToken: {
        base: 'new',
        endpoint: '/refresh-token',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ refreshToken: body.refreshToken })
    },

    updateProfile: {
        base: 'new',
        endpoint: '/update-profile',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }),
        transform: (body) => ({
            accessToken: body.accessToken,
            address: body.address || undefined,
            phone: body.phone || undefined
        })
    },

    forgotPassword: {
        base: 'new',
        endpoint: '/forgot-password',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ email: body.email })
    },

    confirmForgotPassword: {
        base: 'new',
        endpoint: '/confirm-forgot-password',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({
            email: body.email,
            confirmation_code: body.confirmation_code,
            new_password: body.new_password
        })
    },

    deleteAccount: {
        base: 'new',
        endpoint: '/delete-account',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({
            accessToken: body.accessToken,
            reason: body.reason || undefined
        })
    },

    // ─── Orders / Checkout (Stripe) ─────────────────────────────────
    checkout: {
        base: 'new',
        endpoint: '/checkout',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({
            address: body.address,
            phone: body.phone,
            paymentMethod: body.paymentMethod || 'card',
            total: body.total,
            items: body.items || []
        })
    },

    // ─── Admin ───────────────────────────────────────────────────────
    adminAccess: {
        base: 'new',
        endpoint: '/admin',
        method: 'GET',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: () => ({})
    },

    adminGetOrders: {
        base: 'new',
        endpoint: '/admin/orders',
        method: 'GET',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: () => ({})
    },

    adminUpdateOrder: {
        base: 'new',
        endpoint: '/admin/orders',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({ id: body.id, status: body.status })
    },

    // ─── Images (existing service) ──────────────────────────────────
    uploadImage: {
        base: 'new',
        endpoint: '/images/user',
        method: 'PUT',
        headers: (body, token) => {
            const headers = { 'x-api-key': API_KEY };
            if (token) headers['Authorization'] = `${token}`;
            if (body && body.file && body.file.type) headers['Content-Type'] = body.file.type;
            return headers;
        },
        transform: (body) => body
    },

    getImages: {
        base: 'new',
        endpoint: '/images',
        method: 'GET',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: () => ({})
    },

    deleteImage: {
        base: 'new',
        endpoint: '/images/user',
        method: 'DELETE',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({ image_name: body.image_name })
    },

    // ─── Ads (existing service) ─────────────────────────────────────
    ads: {
        base: 'new',
        endpoint: '/ads',
        method: 'GET',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => body.id ? { id: body.id } : {}
    },

    createAd: {
        base: 'new',
        endpoint: '/user/ads',
        method: 'POST',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({
            title: body.title,
            image_url: body.image_url,
            description: body.description,
            region: body.region,
            budget: body.budget || 0,
            reward_per_view: body.reward_per_view || 0,
            type: body.type || 'native',
            redirection_link: body.redirection_link || null
        })
    },

    deleteAd: {
        base: 'new',
        endpoint: '/user/ads',
        method: 'DELETE',
        headers: (body, token) => ({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({ id: body.id })
    },

    watchedAd: {
        base: 'new',
        endpoint: '/user/watched/ads',
        method: 'PATCH',
        headers: (body, token) => ({
            'Content-Type': 'text/plain',
            'Authorization': token ? `Bearer ${token}` : '',
            'x-api-key': API_KEY
        }),
        transform: (body) => ({ id: body.id })
    },

    requestUploadUrl: {
        base: 'new',
        endpoint: '/images/user',
        method: 'PUT',
        headers: (body, token) => {
            const headers = { 'x-api-key': API_KEY };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            return headers;
        },
        transform: (body) => {
            if (body.file && body.file instanceof File) {
                return body.file;
            }
            if (body.fileName && body.contentType) {
                console.log('Converting from old format request. This might not work as expected.');
                return body;
            }
            return body;
        }
    }
};

module.exports = apiMapNew;
