/* eslint-disable indent */
import {
    SYNC_CART,
    SERVER_ADD_TO_CART,
    SERVER_UPDATE_CART_ITEM,
    SERVER_REMOVE_CART_ITEM,
    SERVER_APPLY_VOUCHER,
    SERVER_REMOVE_VOUCHER
} from '@/constants/constants';
import { displayActionMessage } from '@/helpers/utils';
import { call, put } from 'redux-saga/effects';
import { setLoading, setRequestStatus } from '@/redux/actions/miscActions';
import { syncCartSuccess, syncCartFailure } from '@/redux/actions/cartActions';
import api from '@/services/api';

function* cartSaga({ type, payload }) {
    switch (type) {
        case SYNC_CART: {
            try {
                yield put(setLoading(true));
                const cartData = yield call(api.getCart);
                yield put(syncCartSuccess(cartData));
                yield put(setLoading(false));
            } catch (e) {
                yield put(syncCartFailure(e?.message));
                yield put(setLoading(false));
            }
            break;
        }
        case SERVER_ADD_TO_CART: {
            try {
                yield put(setLoading(true));
                const cartData = yield call(api.addToCart, payload.variantId, payload.quantity);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Added to cart', 'success');
                yield put(setLoading(false));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Cannot add to cart'));
                yield call(displayActionMessage, e?.message || 'Cannot add to cart', 'error');
                yield put(setLoading(false));
            }
            break;
        }
        case SERVER_UPDATE_CART_ITEM: {
            try {
                const cartData = yield call(api.updateCartItem, payload.itemId, payload.quantity);
                yield put(syncCartSuccess(cartData));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Cannot update cart'));
                yield call(displayActionMessage, e?.message || 'Cannot update', 'error');
            }
            break;
        }
        case SERVER_REMOVE_CART_ITEM: {
            try {
                const cartData = yield call(api.removeCartItem, payload);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Removed from cart', 'info');
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Cannot remove item'));
            }
            break;
        }
        case SERVER_APPLY_VOUCHER: {
            try {
                yield put(setLoading(true));
                const cartData = yield call(api.applyVoucher, payload);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Voucher applied', 'success');
                yield put(setLoading(false));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Invalid voucher'));
                yield call(displayActionMessage, e?.message || 'Invalid voucher', 'error');
                yield put(setLoading(false));
            }
            break;
        }
        case SERVER_REMOVE_VOUCHER: {
            try {
                const cartData = yield call(api.removeVoucher);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Voucher removed', 'info');
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Cannot remove voucher'));
            }
            break;
        }
        default:
            throw new Error(`Unexpected cart action type: ${type}`);
    }
}

export default cartSaga;
