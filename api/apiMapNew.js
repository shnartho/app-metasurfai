
// Consolidated (no duplicates) new API map.
// NEW API ALWAYS REQUIRES an API key: set API_KEY (preferred) or X_API_KEY / NEW_API_KEY (legacy) in env.
const API_KEY = process.env.API_KEY
// Fail fast if missing so misconfiguration is obvious (you can downgrade to console.warn if needed)
if (!API_KEY) {
    console.error('Missing required API_KEY environment variable for NEW API calls.');
}

const apiMapNew = {
    // Status check (no auth required)
    status: {
        base: 'new',
        endpoint: '/status',
        method: 'GET',
        headers: () => ({ 'x-api-key': API_KEY }),
        transform: () => ({})
    },
    
    // Authentication endpoints
    signup: {
        base: 'new',
        endpoint: '/auth/signup',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json', 'x-api-key': API_KEY }),
        transform: (body) => ({ 
            email: body.email, 
            password: body.password, 
            region: body.region,
            balance: body.balance || 0 // Optional initial balance
        })
    },
    
    login: {
        base: 'new',
        endpoint: '/auth/login',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json', 'x-api-key': API_KEY }),
        transform: (body) => ({ email: body.email, password: body.password })
    },
    
    // User profile endpoints
    profile: {
        base: 'new',
        endpoint: '/user/profile',
        method: 'GET',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '', 
            'x-api-key': API_KEY 
        }),
        transform: () => ({})
    },
    
    updateBalance: {
        base: 'new',
        endpoint: '/user/balance',
        method: 'PATCH',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '', 
            'x-api-key': API_KEY 
        }),
        transform: (body) => ({ balance: parseFloat(body.amount) })
    },
    
    // Image handling endpoints
    uploadImage: {
        base: 'new',
        endpoint: '/images/user',
        method: 'PUT',
        headers: (body, token) => {
            // Content-Type should be set to image/jpeg or appropriate type by the caller or fetch
            const headers = { 'x-api-key': API_KEY };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            // If file type is provided, set Content-Type
            if (body && body.file && body.file.type) headers['Content-Type'] = body.file.type;
            return headers;
        },
        transform: (body) => body // Pass through the file directly
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
    
    // Ad endpoints
    // Ad endpoints
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
    
    createAdRecord: {
        base: 'new',
        endpoint: '/ads',
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
            budget: body.max_views * body.token_reward, // Calculate budget from max_views * token_reward
            reward_per_view: body.token_reward
        })
    },
    
    updateAd: {
        base: 'new',
        endpoint: '/ads',
        method: 'PATCH',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '', 
            'x-api-key': API_KEY 
        }),
        transform: (body) => {
            const result = { id: body.id };
            // Include optional fields if provided
            if (body.updates?.view_count !== undefined) result.view_count = body.updates.view_count;
            if (body.updates?.description !== undefined) result.description = body.updates.description;
            if (body.updates?.title !== undefined) result.title = body.updates.title;
            if (body.updates?.active !== undefined) result.active = body.updates.active;
            return result;
        }
    },
    
    deleteAd: {
        base: 'new',
        endpoint: '/ads',
        method: 'DELETE',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '', 
            'x-api-key': API_KEY 
        }),
        transform: (body) => ({ id: body.id })
    },
    
    // For backward compatibility with existing code
    requestUploadUrl: {
        base: 'new',
        endpoint: '/images/user', // We'll now use the direct image upload endpoint
        method: 'PUT',
        headers: (body, token) => {
            const headers = { 'x-api-key': API_KEY };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            // Note: Content-Type will be set by fetch based on the file
            return headers;
        },
        transform: (body) => {
            // If we have a raw file, use it directly
            if (body.file && body.file instanceof File) {
                return body.file;
            }
            // If we have fileName and contentType but no file, it might be the old format
            if (body.fileName && body.contentType) {
                console.log('Converting from old format request. This might not work as expected.');
                return body;
            }
            // Otherwise just return the body as-is
            return body;
        }
    }
};

module.exports = apiMapNew;
