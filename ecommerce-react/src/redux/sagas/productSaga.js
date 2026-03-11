/* eslint-disable indent */
import {
  ADD_PRODUCT,
  EDIT_PRODUCT,
  GET_PRODUCTS,
  REMOVE_PRODUCT,
  SEARCH_PRODUCT
} from '@/constants/constants';
import { ADMIN_PRODUCTS } from '@/constants/routes';
import { displayActionMessage } from '@/helpers/utils';
import {
  all, call, put, select
} from 'redux-saga/effects';
import { setLoading, setRequestStatus } from '@/redux/actions/miscActions';
import { history } from '@/routers/AppRouter';
import api from '@/services/api';
import {
  addProductSuccess,
  clearSearchState, editProductSuccess, getProductsSuccess,
  removeProductSuccess,
  searchProductSuccess
} from '../actions/productActions';

function* initRequest() {
  yield put(setLoading(true));
  yield put(setRequestStatus(null));
}

function* handleError(e) {
  yield put(setLoading(false));
  yield put(setRequestStatus(e?.message || 'Failed to fetch products'));
  console.log('ERROR: ', e);
}

function* handleAction(location, message, status) {
  if (location) yield call(history.push, location);
  yield call(displayActionMessage, message, status);
}

function* productSaga({ type, payload }) {
  switch (type) {
    case GET_PRODUCTS:
      try {
        yield initRequest();
        const state = yield select();
        const result = yield call(api.getProducts, payload);

        if (result.products.length === 0) {
          handleError('No items found.');
        } else {
          yield put(getProductsSuccess({
            products: result.products,
            lastKey: result.lastKey !== undefined ? result.lastKey : state.products.lastRefKey,
            total: result.total !== undefined ? result.total : state.products.total
          }));
          yield put(setRequestStatus(''));
        }
        yield put(setLoading(false));
      } catch (e) {
        console.log(e);
        yield handleError(e);
      }
      break;

    case ADD_PRODUCT: {
      try {
        yield initRequest();

        const { imageCollection } = payload;
        const key = api.generateKey();
        const downloadURL = yield call(api.storeImage, payload.image);
        const image = { id: key, url: downloadURL };
        let images = [];

        if (imageCollection.length !== 0) {
          const imageKeys = imageCollection.map(() => api.generateKey());
          const imageUrls = yield all(imageCollection.map((img) => call(api.storeImage, img.file)));
          images = imageUrls.map((url, i) => ({
            id: imageKeys[i],
            url
          }));
        }

        const product = {
          ...payload,
          image: downloadURL,
          imageCollection: [image, ...images]
        };

        yield call(api.addProduct, product);
        yield put(addProductSuccess({
          id: key,
          ...product
        }));
        yield handleAction(ADMIN_PRODUCTS, 'Item succesfully added', 'success');
        yield put(setLoading(false));
      } catch (e) {
        yield handleError(e);
        yield handleAction(undefined, `Item failed to add: ${e?.message}`, 'error');
      }
      break;
    }
    case EDIT_PRODUCT: {
      try {
        yield initRequest();

        const { image, imageCollection } = payload.updates;
        let newUpdates = { ...payload.updates };

        if (image.constructor === File && typeof image === 'object') {
          try {
            yield call(api.deleteImage, payload.id);
          } catch (e) {
            console.error('Failed to delete image ', e);
          }

          const url = yield call(api.storeImage, image);
          newUpdates = { ...newUpdates, image: url };
        }

        if (imageCollection.length > 1) {
          const existingUploads = [];
          const newUploads = [];

          imageCollection.forEach((img) => {
            if (img.file) {
              newUploads.push(img);
            } else {
              existingUploads.push(img);
            }
          });

          const imageKeys = newUploads.map(() => api.generateKey());
          const imageUrls = yield all(newUploads.map((img) => call(api.storeImage, img.file)));
          const images = imageUrls.map((url, i) => ({
            id: imageKeys[i],
            url
          }));
          newUpdates = { ...newUpdates, imageCollection: [...existingUploads, ...images] };
        } else {
          newUpdates = {
            ...newUpdates,
            imageCollection: [{ id: new Date().getTime(), url: newUpdates.image }]
          };
        }

        const serverPatchedProduct = yield call(api.editProduct, payload.id, newUpdates);
        yield put(editProductSuccess({
          id: payload.id,
          updates: serverPatchedProduct
        }));
        yield handleAction(ADMIN_PRODUCTS, 'Item succesfully edited', 'success');
        yield put(setLoading(false));
      } catch (e) {
        yield handleError(e);
        yield handleAction(undefined, `Item failed to edit: ${e.message}`, 'error');
      }
      break;
    }
    case REMOVE_PRODUCT: {
      try {
        yield initRequest();
        yield call(api.removeProduct, payload);
        yield put(removeProductSuccess(payload));
        yield put(setLoading(false));
        yield handleAction(ADMIN_PRODUCTS, 'Item succesfully removed', 'success');
      } catch (e) {
        yield handleError(e);
        yield handleAction(undefined, `Item failed to remove: ${e.message}`, 'error');
      }
      break;
    }
    case SEARCH_PRODUCT: {
      try {
        yield initRequest();
        // clear search data
        yield put(clearSearchState());

        const state = yield select();
        const result = yield call(api.searchProducts, payload.searchKey);

        if (result.products.length === 0) {
          yield handleError({ message: 'No product found.' });
          yield put(clearSearchState());
        } else {
          yield put(searchProductSuccess({
            products: result.products,
            lastKey: result.lastKey !== undefined ? result.lastKey : state.products.searchedProducts.lastRefKey,
            total: result.total !== undefined ? result.total : state.products.searchedProducts.total
          }));
          yield put(setRequestStatus(''));
        }
        yield put(setLoading(false));
      } catch (e) {
        yield handleError(e);
      }
      break;
    }
    default: {
      throw new Error(`Unexpected action type ${type}`);
    }
  }
}

export default productSaga;
