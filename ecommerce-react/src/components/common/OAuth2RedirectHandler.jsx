import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { signInSuccess } from '@/redux/actions/authActions';
import { setProfile } from '@/redux/actions/profileActions';
import { setAuthStatus, setAuthenticating } from '@/redux/actions/miscActions';
import { history } from '@/routers/AppRouter';
import { HOME } from '@/constants/routes';
import { TokenManager } from '@/services/api';
import defaultAvatar from '@/images/defaultAvatar.jpg';
import defaultBanner from '@/images/defaultBanner.jpg';

/**
 * Handles the OAuth2 redirect from the backend.
 * Extracts tokens and user info from URL query params,
 * stores them in localStorage/Redux, and redirects to home.
 */
const OAuth2RedirectHandler = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const role = params.get('role');
    const fullName = params.get('fullName');
    const email = params.get('email');
    const provider = params.get('provider');

    if (accessToken) {
      // Store tokens
      TokenManager.setTokens({ accessToken, refreshToken });

      // Set user profile
      dispatch(setProfile({
        fullname: fullName || email?.split('@')[0] || 'User',
        avatar: defaultAvatar,
        banner: defaultBanner,
        email: email || '',
        address: '',
        mobile: { data: {} },
        role: role || 'USER',
        dateJoined: new Date().getTime()
      }));

      // Set auth state
      dispatch(signInSuccess({
        id: userId || email,
        role: role || 'USER',
        provider: provider?.toLowerCase() || 'oauth2'
      }));

      dispatch(setAuthStatus({
        success: true,
        type: 'auth',
        isError: false,
        message: 'Successfully signed in with social account.'
      }));
      dispatch(setAuthenticating(false));

      // Redirect to home
      history.push(HOME);
    } else {
      // OAuth2 login failed
      dispatch(setAuthStatus({
        success: false,
        type: 'auth',
        isError: true,
        message: 'Social login failed. Please try again.'
      }));
      dispatch(setAuthenticating(false));

      history.push('/signin');
    }
  }, [location, dispatch]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem'
    }}>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
