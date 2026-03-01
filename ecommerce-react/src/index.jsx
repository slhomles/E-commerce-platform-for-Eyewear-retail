import { Preloader } from '@/components/common';
import 'normalize.css/normalize.css';
import React from 'react';
import { render } from 'react-dom';
import 'react-phone-input-2/lib/style.css';
import { signInSuccess, signOutSuccess } from '@/redux/actions/authActions';
import configureStore from '@/redux/store/store';
import '@/styles/style.scss';
import WebFont from 'webfontloader';
import App from './App';
import { TokenManager } from '@/services/api';

WebFont.load({
  google: {
    families: ['Tajawal']
  }
});

const { store, persistor } = configureStore();
const root = document.getElementById('app');

// Render the preloader on initial load
render(<Preloader />, root);

// Check for existing authentication via stored tokens
const initAuth = () => {
  const token = TokenManager.getAccessToken();
  if (token) {
    // User has stored tokens - restore session from persisted Redux state
    const state = store.getState();
    if (state.auth) {
      store.dispatch(signInSuccess(state.auth));
    }
  } else {
    // No token - ensure clean state
    store.dispatch(signOutSuccess());
  }

  // Render the app after checking auth state
  render(<App store={store} persistor={persistor} />, root);
};

initAuth();

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
