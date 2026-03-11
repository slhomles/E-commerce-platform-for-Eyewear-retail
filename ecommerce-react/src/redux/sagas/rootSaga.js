import * as ACTION from '@/constants/constants';
import { takeLatest } from 'redux-saga/effects';
import authSaga from './authSaga';
import productSaga from './productSaga';
import profileSaga from './profileSaga';
import cartSaga from './cartSaga';

function* rootSaga() {
  yield takeLatest([
    ACTION.SIGNIN,
    ACTION.SIGNUP,
    ACTION.SIGNOUT,
    ACTION.RESET_PASSWORD
  ], authSaga);
  yield takeLatest([
    ACTION.ADD_PRODUCT,
    ACTION.SEARCH_PRODUCT,
    ACTION.REMOVE_PRODUCT,
    ACTION.EDIT_PRODUCT,
    ACTION.GET_PRODUCTS
  ], productSaga);
  yield takeLatest([
    ACTION.UPDATE_EMAIL,
    ACTION.UPDATE_PROFILE
  ], profileSaga);
  yield takeLatest([
    ACTION.SYNC_CART,
    ACTION.SERVER_ADD_TO_CART,
    ACTION.SERVER_UPDATE_CART_ITEM,
    ACTION.SERVER_REMOVE_CART_ITEM,
    ACTION.SERVER_APPLY_VOUCHER
  ], cartSaga);
}

export default rootSaga;
