// API Service Layer - REST API client for Spring Boot backend
// Replaces Firebase service with HTTP calls to /api/v1/*

const API_BASE_URL = '/api/v1';

// ============ TOKEN MANAGEMENT ============

const TokenManager = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: ({ accessToken, refreshToken }) => {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    isAuthenticated: () => !!localStorage.getItem('accessToken'),
};

// ============ HTTP CLIENT ============

const request = async (endpoint, options = {}) => {
    const { method = 'GET', body, auth = false, headers = {} } = options;

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (auth) {
        const token = TokenManager.getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

// ============ AUTH API ============

const authAPI = {
    login: async (email, password) => {
        const response = await request('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        // response.data = { accessToken, refreshToken, tokenType, expiresIn }
        if (response.data) {
            TokenManager.setTokens(response.data);
        }
        return response;
    },

    register: async ({ email, password, fullName, phone }) => {
        const response = await request('/auth/register', {
            method: 'POST',
            body: { email, password, fullName, phone },
        });
        return response;
    },

    logout: async () => {
        const refreshToken = TokenManager.getRefreshToken();
        try {
            if (refreshToken) {
                await request('/auth/logout', {
                    method: 'POST',
                    body: { refreshToken },
                });
            }
        } finally {
            TokenManager.clearTokens();
        }
    },

    refreshToken: async () => {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await request('/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
        });
        if (response.data) {
            TokenManager.setTokens(response.data);
        }
        return response;
    },

    forgotPassword: async (email) => {
        return request('/auth/forgot-password', {
            method: 'POST',
            body: { email },
        });
    },

    resetPassword: async (token, newPassword) => {
        return request('/auth/reset-password', {
            method: 'POST',
            body: { token, newPassword },
        });
    },

    changePassword: async (currentPassword, newPassword) => {
        return request('/auth/change-password', {
            method: 'POST',
            body: { currentPassword, newPassword },
            auth: true,
        });
    },

    verifyEmail: async (token) => {
        return request(`/auth/verify-email?token=${token}`, {
            method: 'POST',
        });
    },

    resendVerification: async (email) => {
        return request('/auth/resend-verification', {
            method: 'POST',
            body: { email },
        });
    },
};

// ============ PRODUCT API ============
// NOTE: Backend product API is not yet implemented (skeleton only).
// These functions return mock data for now and will be updated
// when backend product endpoints are ready.

const productAPI = {
    getProducts: async (lastKey) => {
        // TODO: Replace with actual API call when backend is ready
        // return request('/products', { method: 'GET', auth: true });
        return {
            products: [],
            lastKey: null,
            total: 0,
        };
    },

    getSingleProduct: async (id) => {
        // TODO: Replace with actual API call
        // return request(`/products/${id}`, { method: 'GET' });
        return null;
    },

    searchProducts: async (searchKey) => {
        // TODO: Replace with actual API call
        // return request(`/products/search?q=${searchKey}`, { method: 'GET' });
        return {
            products: [],
            lastKey: null,
            total: 0,
        };
    },

    getFeaturedProducts: async (itemsCount) => {
        // TODO: Replace with actual API call
        // return request(`/products/featured?limit=${itemsCount}`, { method: 'GET' });
        return [];
    },

    getRecommendedProducts: async (itemsCount) => {
        // TODO: Replace with actual API call
        // return request(`/products/recommended?limit=${itemsCount}`, { method: 'GET' });
        return [];
    },

    addProduct: async (product) => {
        // TODO: Replace with actual API call
        // return request('/products', { method: 'POST', body: product, auth: true });
        return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...product };
    },

    editProduct: async (id, updates) => {
        // TODO: Replace with actual API call
        // return request(`/products/${id}`, { method: 'PUT', body: updates, auth: true });
        return { id, ...updates };
    },

    removeProduct: async (id) => {
        // TODO: Replace with actual API call
        // return request(`/products/${id}`, { method: 'DELETE', auth: true });
        return { id };
    },

    storeImage: async (imageFile) => {
        // TODO: Replace with actual file upload API call
        // const formData = new FormData();
        // formData.append('file', imageFile);
        // return request('/upload', { method: 'POST', body: formData, auth: true });
        return '/static/salt-image-1.png';
    },

    deleteImage: async (id) => {
        // TODO: Replace with actual API call
        return Promise.resolve();
    },

    generateKey: () => `${Date.now()}-${Math.random().toString(16).slice(2)}`,
};

// ============ PROFILE API ============
// NOTE: Backend profile API is not yet implemented.
// These functions are stubs that will be updated when ready.

const profileAPI = {
    getUser: async () => {
        // TODO: Replace with actual API call
        // return request('/users/me', { method: 'GET', auth: true });
        return null;
    },

    updateProfile: async (id, updates) => {
        // TODO: Replace with actual API call
        // return request('/users/me', { method: 'PUT', body: updates, auth: true });
        return updates;
    },

    updateEmail: async (password, newEmail) => {
        // TODO: Replace with actual API call
        // return request('/users/me/email', { method: 'PUT', body: { password, newEmail }, auth: true });
        return Promise.resolve();
    },

    storeImage: async (id, folder, imageFile) => {
        // TODO: Replace with actual file upload
        return '/static/salt-image-1.png';
    },
};

// ============ BASKET API ============

const basketAPI = {
    saveBasketItems: async (basket, userId) => {
        // TODO: Replace with actual API call when cart API is ready
        // return request('/cart', { method: 'PUT', body: { items: basket }, auth: true });
        return Promise.resolve();
    },
};

// ============ EXPORTS ============

const api = {
    ...authAPI,
    ...productAPI,
    ...profileAPI,
    ...basketAPI,
    TokenManager,
};

export { TokenManager };
export default api;
