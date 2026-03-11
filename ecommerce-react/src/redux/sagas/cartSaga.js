/* eslint-disable indent */
import {
    SYNC_CART,
    SERVER_ADD_TO_CART,
    SERVER_UPDATE_CART_ITEM,
    SERVER_REMOVE_CART_ITEM,
    SERVER_APPLY_VOUCHER
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
                yield call(displayActionMessage, 'Đã thêm vào giỏ hàng', 'success');
                yield put(setLoading(false));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Không thể thêm vào giỏ'));
                yield call(displayActionMessage, e?.message || 'Không thể thêm vào giỏ', 'error');
                yield put(setLoading(false));
            }
            break;
        }
        case SERVER_UPDATE_CART_ITEM: {
            try {
                const cartData = yield call(api.updateCartItem, payload.itemId, payload.quantity);
                yield put(syncCartSuccess(cartData));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Không thể cập nhật giỏ hàng'));
                yield call(displayActionMessage, e?.message || 'Không thể cập nhật', 'error');
            }
            break;
        }
        case SERVER_REMOVE_CART_ITEM: {
            try {
                const cartData = yield call(api.removeCartItem, payload);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Đã xóa khỏi giỏ hàng', 'info');
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Không thể xóa'));
            }
            break;
        }
        case SERVER_APPLY_VOUCHER: {
            try {
                yield put(setLoading(true));
                const cartData = yield call(api.applyVoucher, payload);
                yield put(syncCartSuccess(cartData));
                yield call(displayActionMessage, 'Đã áp dụng voucher', 'success');
                yield put(setLoading(false));
            } catch (e) {
                yield put(setRequestStatus(e?.message || 'Voucher không hợp lệ'));
                yield call(displayActionMessage, e?.message || 'Voucher không hợp lệ', 'error');
                yield put(setLoading(false));
            }
            break;
        }
        default:
            throw new Error(`Unexpected cart action type: ${type}`);
    }
}

export default cartSaga;
