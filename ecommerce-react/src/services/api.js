// API Service Layer - REST API client for Spring Boot backend
// Connects to /api/v1/* endpoints

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

const productAPI = {
    /**
     * GET /api/v1/products — List + filter + paginate
     * @param {object} filters - { brand, category, gender, type, minPrice, maxPrice, ... }
     * @param {number} page
     * @param {number} size
     * @param {string} sortBy - price_asc, price_desc, newest, name_asc, name_desc
     */
    getProducts: async (lastRef, filters = {}) => {
        const params = new URLSearchParams();
        const { page = 0, size = 12, sortBy = 'newest', ...rest } = filters;
        params.set('page', page);
        params.set('size', size);
        params.set('sortBy', sortBy);

        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value);
            }
        });

        const response = await request(`/products?${params.toString()}`);
        const pageData = response.data;
        return {
            products: (pageData.content || []).map(p => ({
                ...p,
                price: p.salePrice || p.basePrice || 0,
                brand: p.brandName || '',
                image: p.imageUrl || '',
                description: p.name || '',
                keywords: [p.categoryName, p.brandName, p.gender, p.frameShape, p.type].filter(Boolean)
            })),
            lastKey: pageData.last ? null : pageData.number + 1,
            total: pageData.totalElements || 0,
        };
    },

    getSingleProduct: async (slugOrId, reduxStoreProducts = []) => {
        // Find by ID in redux to get the slug, or just use slugOrId if it's already a slug
        let queryVal = slugOrId;
        const fromStore = reduxStoreProducts.find(p => p.id === slugOrId);
        if (fromStore && fromStore.slug) {
            queryVal = fromStore.slug;
        }

        const response = await request(`/products/${queryVal}`);
        const p = response.data;
        if (!p) return null;

        const price = p.salePrice || p.basePrice || 0;
        const brand = p.brand?.name || '';
        const image = p.variants?.length > 0 ? p.variants[0].imageUrl : '';
        const availableColors = p.variants ? p.variants.map(v => v.colorHex || v.colorName) : [];
        const sizes = p.specs?.lensWidth ? [p.specs.lensWidth] : [50, 52, 54, 56];
        let imageCollection = [];
        if (p.variants) {
            p.variants.forEach(v => {
                if (v.imageUrl) imageCollection.push({ id: v.id + '-main', url: v.imageUrl });
                if (v.imageGallery) {
                    v.imageGallery.forEach((url, i) => imageCollection.push({ id: v.id + '-' + i, url }));
                }
            });
        }

        return {
            ...p,
            price,
            brand,
            image,
            availableColors,
            sizes,
            imageCollection,
            maxQuantity: p.variants?.length > 0 ? p.variants[0].stockAvailable : 100,
            keywords: [p.category?.name, p.brand?.name, p.gender, p.frameShape, p.type].filter(Boolean)
        };
    },

    searchProducts: async (searchKey) => {
        const response = await request(`/products/search?keyword=${encodeURIComponent(searchKey)}`);
        const pageData = response.data;
        return {
            products: (pageData.content || []).map(p => ({
                ...p,
                price: p.salePrice || p.basePrice || 0,
                brand: p.brandName || '',
                image: p.imageUrl || '',
                description: p.name || '',
                keywords: [p.categoryName, p.brandName, p.gender, p.frameShape, p.type].filter(Boolean)
            })),
            lastKey: null,
            total: pageData.totalElements || 0,
        };
    },

    getFeaturedProducts: async (itemsCount = 8) => {
        const response = await request(`/products/featured?limit=${itemsCount}`);
        const items = response.data || [];
        return items.map(p => ({ ...p, price: p.salePrice || p.basePrice || 0, brand: p.brandName || '', image: p.imageUrl || '' }));
    },

    getRecommendedProducts: async (itemsCount = 8) => {
        const response = await request(`/products/recommended?limit=${itemsCount}`);
        const items = response.data || [];
        return items.map(p => ({ ...p, price: p.salePrice || p.basePrice || 0, brand: p.brandName || '', image: p.imageUrl || '' }));
    },

    getRelatedProducts: async (productId, limit = 6) => {
        const response = await request(`/products/${productId}/related?limit=${limit}`);
        const items = response.data || [];
        return items.map(p => ({ ...p, price: p.salePrice || p.basePrice || 0, brand: p.brandName || '', image: p.imageUrl || '' }));
    },

    getCategories: async () => {
        const response = await request('/categories');
        return response.data || [];
    },

    getBrands: async () => {
        const response = await request('/brands');
        return response.data || [];
    },

    // Admin product operations
    addProduct: async (product) => {
        let defaultBrandId = null;
        let defaultCategoryId = null;

        try {
            const brandsRes = await productAPI.getBrands();
            const categoriesRes = await productAPI.getCategories();
            if (brandsRes && brandsRes.length > 0) defaultBrandId = brandsRes[0].id;
            if (categoriesRes && categoriesRes.length > 0) defaultCategoryId = categoriesRes[0].id;
        } catch (e) {
            console.error("Could not fetch brands/categories initially", e);
        }

        const payload = {
            name: product.name,
            slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: product.description || '',
            brandId: defaultBrandId,
            categoryId: defaultCategoryId,
            type: "FRAME", // FIX: Using correct ENUM
            basePrice: product.price || 0,
            salePrice: null,
            gender: "UNISEX",

            variants: [
                {
                    sku: "SKU-" + Date.now(),
                    colorName: product.availableColors?.[0] || 'Default',
                    colorHex: product.availableColors?.[0] || '#000000',
                    imageUrl: product.image || '',
                    imageGallery: (product.imageCollection || []).map(img => img.url),
                    priceAdjustment: 0,
                    initialStock: product.maxQuantity || 0
                }
            ]
        };

        const response = await request('/admin/products', {
            method: 'POST',
            body: payload,
            auth: true,
        });
        return response.data;
    },

    editProduct: async (id, updates) => {
        const response = await request(`/admin/products/${id}`, {
            method: 'PUT',
            body: updates,
            auth: true,
        });
        return response.data;
    },

    removeProduct: async (id) => {
        await request(`/admin/products/${id}`, {
            method: 'DELETE',
            auth: true,
        });
        return { id };
    },

    storeImage: async (imageFile) => {
        // TODO: Implement file upload endpoint
        return '/static/salt-image-1.png';
    },

    deleteImage: async (id) => {
        return Promise.resolve();
    },

    generateKey: () => `${Date.now()}-${Math.random().toString(16).slice(2)}`,
};

// ============ CART API ============

const cartAPI = {
    getCart: async () => {
        const response = await request('/cart', { auth: true });
        return response.data;
    },

    addToCart: async (variantId, quantity = 1) => {
        const response = await request('/cart/add', {
            method: 'POST',
            body: { variantId, quantity },
            auth: true,
        });
        return response.data;
    },

    updateCartItem: async (itemId, quantity) => {
        const response = await request('/cart/update', {
            method: 'PUT',
            body: { itemId, quantity },
            auth: true,
        });
        return response.data;
    },

    removeCartItem: async (itemId) => {
        const response = await request(`/cart/remove?itemId=${itemId}`, {
            method: 'DELETE',
            auth: true,
        });
        return response.data;
    },

    applyVoucher: async (code) => {
        const response = await request('/cart/voucher', {
            method: 'POST',
            body: { code },
            auth: true,
        });
        return response.data;
    },

    saveBasketItems: async (basket, userId) => {
        // Sync local basket to server
        for (const item of basket) {
            if (item.selectedVariantId) {
                await cartAPI.addToCart(item.selectedVariantId, item.quantity || 1);
            }
        }
    },
};

// ============ ADMIN API ============

const adminAPI = {
    createCategory: async (categoryData) => {
        const response = await request('/admin/categories', {
            method: 'POST',
            body: categoryData,
            auth: true,
        });
        return response.data;
    },

    importInventory: async (items) => {
        const response = await request('/admin/inventory/import', {
            method: 'POST',
            body: { items },
            auth: true,
        });
        return response;
    },

    getRevenueStats: async () => {
        const response = await request('/admin/stats/revenue', { auth: true });
        return response.data;
    },

    getAllProducts: async (page = 0, size = 20) => {
        const response = await request(`/admin/products?page=${page}&size=${size}`, { auth: true });
        const pageData = response.data;
        if (pageData && pageData.content) {
            pageData.content = pageData.content.map(p => ({
                ...p,
                price: p.salePrice || p.basePrice || 0,
                brand: p.brandName || '',
                image: p.imageUrl || '',
                maxQuantity: p.inStock ? 100 : 0
            }));
        }
        return pageData;
    },
};

// ============ PROFILE API ============

const profileAPI = {
    getUser: async () => {
        // TODO: Replace with actual API call
        return null;
    },

    updateProfile: async (id, updates) => {
        // TODO: Replace with actual API call
        return updates;
    },

    updateEmail: async (password, newEmail) => {
        // TODO: Replace with actual API call
        return Promise.resolve();
    },

    storeImage: async (id, folder, imageFile) => {
        // TODO: Replace with actual file upload
        return '/static/salt-image-1.png';
    },
};

// ============ EXPORTS ============

const api = {
    ...authAPI,
    ...productAPI,
    ...cartAPI,
    ...adminAPI,
    ...profileAPI,
    TokenManager,
};

export { TokenManager };
export default api;
