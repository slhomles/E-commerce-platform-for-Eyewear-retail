import {
  RESET_PASSWORD,
  SIGNIN, SIGNOUT, SIGNUP
} from '@/constants/constants';
import { SIGNIN as ROUTE_SIGNIN } from '@/constants/routes';
import defaultAvatar from '@/images/defaultAvatar.jpg';
import defaultBanner from '@/images/defaultBanner.jpg';
import { call, put } from 'redux-saga/effects';
import { signInSuccess, signOutSuccess } from '@/redux/actions/authActions';
import { clearBasket } from '@/redux/actions/basketActions';
import { resetCheckout } from '@/redux/actions/checkoutActions';
import { resetFilter } from '@/redux/actions/filterActions';
import { setAuthenticating, setAuthStatus } from '@/redux/actions/miscActions';
import { clearProfile, setProfile } from '@/redux/actions/profileActions';
import { history } from '@/routers/AppRouter';
import api from '@/services/api';

function* handleError(e) {
  const obj = { success: false, type: 'auth', isError: true };
  yield put(setAuthenticating(false));

  const message = e?.data?.message || e?.message || 'An error occurred';
  yield put(setAuthStatus({ ...obj, message }));
}

function* initRequest() {
  yield put(setAuthenticating());
  yield put(setAuthStatus({}));
}

function* authSaga({ type, payload }) {
  switch (type) {
    case SIGNIN:
      try {
        yield initRequest();
        const response = yield call(api.login, payload.email, payload.password);

        // Set user profile from token data
        // For now, set basic profile until we have a /users/me endpoint
        const user = {
          fullname: response.data?.fullName || payload.email.split('@')[0],
          avatar: defaultAvatar,
          banner: defaultBanner,
          email: payload.email,
          address: '',
          mobile: { data: {} },
          role: response.data?.role || 'USER',
          dateJoined: new Date().getTime()
        };

        yield put(setProfile(user));
        yield put(signInSuccess({
          id: response.data?.userId || payload.email,
          role: user.role,
          provider: 'password'
        }));
        yield put(setAuthStatus({
          success: true,
          type: 'auth',
          isError: false,
          message: 'Successfully signed in. Redirecting...'
        }));
        yield put(setAuthenticating(false));
      } catch (e) {
        yield handleError(e);
      }
      break;
    case SIGNUP:
      try {
        yield initRequest();

        const fullname = payload.fullname.split(' ').map((name) => name[0].toUpperCase().concat(name.substring(1))).join(' ');

        const response = yield call(api.register, {
          email: payload.email,
          password: payload.password,
          fullName: fullname,
          phone: payload.phone || ''
        });

        yield put(setAuthStatus({
          success: true,
          type: 'auth',
          isError: false,
          message: response.message || 'Registration successful! Please check your email for verification.'
        }));
        yield put(setAuthenticating(false));
      } catch (e) {
        yield handleError(e);
      }
      break;
    case SIGNOUT: {
      try {
        yield initRequest();
        yield call(api.logout);
        yield put(clearBasket());
        yield put(clearProfile());
        yield put(resetFilter());
        yield put(resetCheckout());
        yield put(signOutSuccess());
        yield put(setAuthenticating(false));
        yield call(history.push, ROUTE_SIGNIN);
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case RESET_PASSWORD: {
      try {
        yield initRequest();
        yield call(api.forgotPassword, payload);
        yield put(setAuthStatus({
          success: true,
          type: 'reset',
          message: 'Password reset email has been sent to your provided email.'
        }));
        yield put(setAuthenticating(false));
      } catch (e) {
        yield handleError(e);
      }
      break;
    }
    default: {
      throw new Error('Unexpected Action Type.');
    }
  }
}

export default authSaga;
