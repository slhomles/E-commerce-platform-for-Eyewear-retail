import {
    SYNC_CART_SUCCESS,
    SYNC_CART_FAILURE
} from '@/constants/constants';

/**
 * Server cart reducer — Stores cart data synced from backend.
 * Separate from basketReducer which handles client-side-only basket.
 */
const initialState = {
    cartId: null,
    items: [],
    totalItems: 0,
    subtotal: 0,
    voucherCode: null,
    discountAmount: 0,
    total: 0,
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SYNC_CART_SUCCESS:
            return {
                ...state,
                cartId: action.payload.cartId,
                items: action.payload.items || [],
                totalItems: action.payload.totalItems || 0,
                subtotal: action.payload.subtotal || 0,
                voucherCode: action.payload.voucherCode,
                discountAmount: action.payload.discountAmount || 0,
                total: action.payload.total || 0,
                error: null
            };
        case SYNC_CART_FAILURE:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};
