import { ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';
import { CustomInput } from '@/components/formik';
import { Field, Form, Formik } from 'formik';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { signInAdmin } from '@/redux/actions/authActions';
import { setAuthenticating, setAuthStatus } from '@/redux/actions/miscActions';
import { SIGNIN } from '@/constants/routes';
import * as Yup from 'yup';

const AdminSignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ.')
    .required('Vui lòng nhập Email.'),
  password: Yup.string()
    .required('Vui lòng nhập Mật khẩu.')
});

const AdminSignIn = ({ history }) => {
  const { authStatus, isAuthenticating } = useSelector((state) => ({
    authStatus: state.app.authStatus,
    isAuthenticating: state.app.isAuthenticating
  }));

  const dispatch = useDispatch();

  useScrollTop();
  useDocumentTitle('Đăng nhập Admin | EyseGlass');

  useEffect(() => () => {
    dispatch(setAuthStatus(null));
    dispatch(setAuthenticating(false));
  }, []);

  const onSubmitForm = (form) => {
    dispatch(signInAdmin(form.email, form.password));
  };

  return (
    <div className="auth-content" style={{ maxWidth: '45rem', margin: '4rem auto' }}>
      {authStatus?.success && (
        <div className="loader">
          <h3 className="toast-success auth-success">
            {authStatus.message}
            <LoadingOutlined />
          </h3>
        </div>
      )}
      {!authStatus?.success && (
        <>
          {authStatus?.message && (
            <h5 className="text-center toast-error">
              {authStatus?.message}
            </h5>
          )}
          <div className={`auth ${authStatus?.message && (!authStatus?.success && 'input-error')}`} style={{ flexDirection: 'column', borderRadius: '8px', padding: '3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ 
                background: '#4a4a4a', 
                color: 'white', 
                padding: '4px 16px', 
                borderRadius: '20px', 
                fontSize: '1.2rem', 
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                KHU VỰC NHÂN VIÊN
              </span>
              <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                Chào mừng trở lại
              </h2>
              <p style={{ color: '#666', fontSize: '1.4rem' }}>
                Đăng nhập để vào trang quản trị dành cho nhân viên.
              </p>
            </div>

            <div className="auth-main">
              <div className="auth-wrapper">
                <Formik
                  initialValues={{
                    email: '',
                    password: ''
                  }}
                  validateOnChange
                  validationSchema={AdminSignInSchema}
                  onSubmit={onSubmitForm}
                >
                  {() => (
                    <Form>
                      <div className="auth-field">
                        <Field
                          disabled={isAuthenticating}
                          name="email"
                          type="email"
                          label="Email"
                          placeholder="admin@example.com"
                          component={CustomInput}
                        />
                      </div>
                      <div className="auth-field" style={{ marginTop: '1.5rem' }}>
                        <Field
                          disabled={isAuthenticating}
                          name="password"
                          type="password"
                          label="Mật khẩu"
                          placeholder="••••••"
                          component={CustomInput}
                        />
                      </div>
                      <br />
                      <div className="auth-field auth-action" style={{ marginTop: '1rem' }}>
                        <button
                          className="button auth-button"
                          disabled={isAuthenticating}
                          type="submit"
                          style={{ width: '100%', borderRadius: '4px', padding: '1.2rem', fontSize: '1.4rem' }}
                        >
                          {isAuthenticating ? 'Đang đăng nhập' : 'Đăng nhập'}
                          &nbsp;
                          {isAuthenticating ? <LoadingOutlined /> : <ArrowRightOutlined />}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
              <span style={{ color: '#666', fontSize: '1.3rem' }}>
                Không phải nhân viên?{' '}
              </span>
              <Link to={SIGNIN} style={{ fontWeight: 'bold', fontSize: '1.3rem', textDecoration: 'underline' }}>
                Đăng nhập khách hàng
              </Link>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

AdminSignIn.propTypes = {
  history: PropType.shape({
    push: PropType.func
  }).isRequired
};

export default AdminSignIn;
