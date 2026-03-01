import * as ACTION from '@/constants/constants';
import { takeLatest } from 'redux-saga/effects';
import authSaga from './authSaga';
import productSaga from './productSaga';
import profileSaga from './profileSaga';

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
}

export default rootSaga;
