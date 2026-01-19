
const apiAWS = {
    // Status/Health check
    status: {
        base: 'backend',
        endpoint: '/',
        method: 'GET',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: () => ({})
    },
    
    // === AUTH ENDPOINTS ===
    signup: {
        base: 'backend',
        endpoint: '/signup',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({
            email: body.email, 
            password: body.password,
            name: body.name || '',
            address: body.address || ''
        })
    },
    
    login: {
        base: 'backend',
        endpoint: '/login',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ 
            email: body.email, 
            password: body.password 
        })
    },
    
    logout: {
        base: 'backend',
        endpoint: '/logout',
        method: 'POST',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: () => ({})
    },
    
    refreshToken: {
        base: 'backend',
        endpoint: '/refresh-token',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({
            refreshToken: body.refreshToken 
        })
    },
    
    updateProfile: {
        base: 'backend',
        endpoint: '/update-profile',
        method: 'POST',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: (body) => ({
            address: body.address,
            phone: body.phone,
            accessToken: body.accessToken
        })
    },
    
    // Alias for profile (for compatibility)
    profile: {
        base: 'backend',
        endpoint: '/update-profile',
        method: 'POST',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: (body) => ({
            address: body.address,
            phone: body.phone,
            accessToken: body.accessToken
        })
    },
    
    forgotPassword: {
        base: 'backend',
        endpoint: '/forgot-password',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ 
            email: body.email 
        })
    },
    
    confirmForgotPassword: {
        base: 'backend',
        endpoint: '/confirm-forgot-password',
        method: 'POST',
        headers: () => ({ 'Content-Type': 'application/json' }),
        transform: (body) => ({ 
            email: body.email, 
            confirmation_code: body.confirmationCode || body.confirmation_code,
            new_password: body.newPassword || body.new_password
        })
    },
    
    deleteAccount: {
        base: 'backend',
        endpoint: '/delete-account',
        method: 'POST',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: (body) => ({ 
            accessToken: body.accessToken,
            reason: body.reason || 'No reason provided'
        })
    },
    
    // === ORDER/PAYMENT ENDPOINTS ===
    getOrders: {
        base: 'backend',
        endpoint: '/orders',
        method: 'GET',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: () => ({})
    },
    
    // === ADMIN ENDPOINTS ===
    adminAccess: {
        base: 'backend',
        endpoint: '/admin',
        method: 'GET',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: () => ({})
    },
    
    adminGetAllOrders: {
        base: 'backend',
        endpoint: '/admin/orders',
        method: 'GET',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: () => ({})
    },
    
    adminUpdateOrderStatus: {
        base: 'backend',
        endpoint: '/admin/orders',
        method: 'POST',
        headers: (body, token) => ({ 
            'Content-Type': 'application/json', 
            'Authorization': token ? `Bearer ${token}` : '' 
        }),
        transform: (body) => ({ 
            id: body.id, 
            status: body.status 
        })
    }
    
    // NOTE: NO ads, images, or other endpoints exist in the actual backend
    // This backend is focused on:
    // - User authentication (signup, login, profile, password reset, account deletion)
    // - Order management (checkout, view orders, admin controls)
    // - Payment processing (via Stripe webhook integration)
};

module.exports = apiAWS;
