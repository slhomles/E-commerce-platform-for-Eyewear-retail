import { FacebookOutlined, GithubFilled, GoogleOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';

const SocialLogin = ({ isLoading }) => {
  return (
    <div className="auth-provider">
      <button
        className="button auth-provider-button provider-facebook"
        disabled
        type="button"
        title="Coming soon"
      >
        <FacebookOutlined />
        Continue with Facebook
      </button>
      <button
        className="button auth-provider-button provider-google"
        disabled
        type="button"
        title="Coming soon"
      >
        <GoogleOutlined />
        Continue with Google
      </button>
      <button
        className="button auth-provider-button provider-github"
        disabled
        type="button"
        title="Coming soon"
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
