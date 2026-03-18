import { FacebookOutlined, GithubFilled, GoogleOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';

const BACKEND_URL = 'http://localhost:8080';

const SocialLogin = ({ isLoading }) => {
  const handleSocialLogin = (provider) => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="auth-provider">
      <button
        className="button auth-provider-button provider-facebook"
        disabled={isLoading}
        type="button"
        onClick={() => handleSocialLogin('facebook')}
      >
        <FacebookOutlined />
        Continue with Facebook
      </button>
      <button
        className="button auth-provider-button provider-google"
        disabled={isLoading}
        type="button"
        onClick={() => handleSocialLogin('google')}
      >
        <GoogleOutlined />
        Continue with Google
      </button>
      <button
        className="button auth-provider-button provider-github"
        disabled={isLoading}
        type="button"
        onClick={() => handleSocialLogin('github')}
      >
        <GithubFilled />
        Continue with GitHub
      </button>
    </div>
  );
};

SocialLogin.propTypes = {
  isLoading: PropType.bool.isRequired
};

export default SocialLogin;

