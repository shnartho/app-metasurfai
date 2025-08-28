// Old API map (base: 'old' used for hybrid resolution)
const apiMapOld = {
    signup: {
        base: 'old',
        endpoint: '/signup',
        method: 'POST',
        headers: function(body) { return { 'Content-Type': 'application/json' }; },
        transform: function(body) { return { email: body.email, password: body.password }; }
    },
    login: {
        base: 'old',
        endpoint: '/login',
        method: 'POST',
        headers: function(body, token) { return { 'Content-Type': 'application/json' }; },
        transform: function(body) { return { email: body.email, password: body.password }; }
    },
    profile: {
        base: 'old',
        endpoint: '/profile',
        method: 'GET',
        headers: function(body, token) { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }; },
        transform: function() { return {}; }
    },
    ads: {
        base: 'old',
        endpoint: '/ads',
        method: 'GET',
        headers: function(body, token) { return { 'Content-Type': 'application/json' }; },
        transform: function() { return {}; }
    },
    createAd: {
        base: 'old',
        endpoint: '/ads',
        method: 'POST',
        headers: function(body, token) { return { 'Content-Type': 'application/json' }; },
        transform: function(body) { return { ...body }; }
    },
    deleteAd: {
        base: 'old',
        endpoint: '/ads',
        method: 'DELETE',
        headers: function(body, token) { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }; },
        transform: function(body) { return { id: body.id }; }
    },
    billboards: {
        base: 'old',
        endpoint: '/billboards',
        method: 'GET',
        headers: function(body, token) { return { 'Content-Type': 'application/json' }; },
        transform: function() { return {}; }
    }
};

module.exports = apiMapOld;
