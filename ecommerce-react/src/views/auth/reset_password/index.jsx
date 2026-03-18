import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import api from '@/services/api';
import { SIGNIN } from '@/constants/routes';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const query = useQuery();
  const history = useHistory();
  const token = query.get('token');

  useScrollTop();
  useDocumentTitle('Reset Password | E-Commerce');

  useEffect(() => {
    if (!token) {
      setMessage({ text: 'Invalid or missing token.', type: 'error' });
    }
  }, [token]);

  const onSubmit = async () => {
    if (!token) return;
    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await api.resetPassword(token, password);
      setMessage({ text: 'Password reset successful. Redirecting to login...', type: 'success' });
      setTimeout(() => {
        history.push(SIGNIN);
      }, 3000);
    } catch (error) {
      setMessage({ text: error.message || 'An error occurred while resetting password.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot_password" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {message.text && (
        <h5 className={`text-center ${message.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {message.text}
        </h5>
      )}
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>
      <br />
      
      <div className="auth-field" style={{ marginBottom: '1.5rem' }}>
        <input
          className="input-form"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting || message.type === 'success' || !token}
          style={{ width: '100%', padding: '1rem', border: '1px solid #e1e1e1' }}
        />
      </div>
      <div className="auth-field" style={{ marginBottom: '2rem' }}>
        <input
          className="input-form"
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting || message.type === 'success' || !token}
          style={{ width: '100%', padding: '1rem', border: '1px solid #e1e1e1' }}
        />
      </div>

      <button
        className="button w-100-mobile"
        disabled={isSubmitting || message.type === 'success' || !token}
        onClick={onSubmit}
        type="button"
        style={{ width: '100%' }}
      >
        {isSubmitting ? <LoadingOutlined /> : <CheckOutlined />}
        &nbsp;
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  );
};

export default ResetPassword;
