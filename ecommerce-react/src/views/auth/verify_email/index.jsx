import { CheckOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import api from '@/services/api';
import { SIGNIN } from '@/constants/routes';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  
  const query = useQuery();
  const history = useHistory();
  const token = query.get('token');

  useScrollTop();
  useDocumentTitle('Verify Email | E-Commerce');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        await api.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now sign in.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="forgot_password" style={{ maxWidth: '400px', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <LoadingOutlined style={{ fontSize: '3rem', color: '#101828' }} />
          <h2 style={{ marginTop: '2rem' }}>Verifying your email...</h2>
          <p>Please wait a moment while we confirm your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckOutlined style={{ fontSize: '3rem', color: '#4CAF50' }} />
          <h2 style={{ marginTop: '2rem' }}>Verification Successful!</h2>
          <p>{message}</p>
          <br />
          <button
            className="button"
            onClick={() => history.push(SIGNIN)}
            style={{ width: '100%' }}
          >
            Go to Sign In
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <ExclamationCircleOutlined style={{ fontSize: '3rem', color: '#ff4d4f' }} />
          <h2 style={{ marginTop: '2rem' }}>Verification Failed</h2>
          <p>{message}</p>
          <br />
          <button
            className="button button-muted"
            onClick={() => history.push(SIGNIN)}
            style={{ width: '100%' }}
          >
            Back to Sign In
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
