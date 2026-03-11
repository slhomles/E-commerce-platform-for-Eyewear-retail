import {
    SYNC_CART,
    SYNC_CART_SUCCESS,
    SYNC_CART_FAILURE,
    SERVER_ADD_TO_CART,
    SERVER_UPDATE_CART_ITEM,
    SERVER_REMOVE_CART_ITEM,
    SERVER_APPLY_VOUCHER
} from '@/constants/constants';

// ==================== Server Cart Actions ====================

export const syncCart = () => ({
    type: SYNC_CART
});

export const syncCartSuccess = (cartData) => ({
    type: SYNC_CART_SUCCESS,
    payload: cartData
});

export const syncCartFailure = (error) => ({
    type: SYNC_CART_FAILURE,
    payload: error
});

export const serverAddToCart = (variantId, quantity = 1) => ({
    type: SERVER_ADD_TO_CART,
    payload: { variantId, quantity }
});

export const serverUpdateCartItem = (itemId, quantity) => ({
    type: SERVER_UPDATE_CART_ITEM,
    payload: { itemId, quantity }
});

export const serverRemoveCartItem = (itemId) => ({
    type: SERVER_REMOVE_CART_ITEM,
    payload: itemId
});

export const serverApplyVoucher = (code) => ({
    type: SERVER_APPLY_VOUCHER,
    payload: code
});
