import { CHECKOUT_STEP_1 } from '@/constants/routes';
import { Form, Formik } from 'formik';
import { displayActionMessage } from '@/helpers/utils';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { StepTracker } from '../components';
import withCheckout from '../hoc/withCheckout';
import VNPayPayment from './VNPayPayment';
import Total from './Total';
import api from '@/services/api';
import { placeOrderSuccess } from '@/redux/actions/orderActions';
import { clearBasket } from '@/redux/actions/basketActions';
import { resetCheckout } from '@/redux/actions/checkoutActions';

const FormSchema = Yup.object().shape({
  type: Yup.string().required('Vui lòng chọn phương thức thanh toán')
});

const Payment = ({ shipping, payment, subtotal, profile }) => {
  useDocumentTitle('Check Out Final Step | Glasses Store');
  useScrollTop();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const initFormikValues = {
    type: payment.type || 'vnpay_visa'
  };

  const onConfirm = async (formValues) => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      // Map payment type to backend enum
      let paymentMethod = 'VNPAY';
      let vnpaySubMethod = null;

      if (formValues.type === 'cod') {
          paymentMethod = 'COD';
      } else {
          vnpaySubMethod = formValues.type;
      }

      const orderData = {
        paymentMethod,
        vnpaySubMethod,
        shippingAddress: {
          fullName: shipping.fullname || profile?.fullname || '',
          phone: shipping.mobile?.value || profile?.mobile?.value || '',
          address: shipping.address || '',
          ward: '',
          district: '',
          city: shipping.isInternational ? 'International' : 'Vietnam',
        },
        customerNote: '',
        voucherCode: null,
      };

      const order = await api.placeOrder(orderData);
      dispatch(placeOrderSuccess(order));
      dispatch(clearBasket());
      dispatch(resetCheckout());

      displayActionMessage('Đang chuyển hướng tới trang thanh toán...', 'success');

      if (order.paymentUrl) {
          window.location.href = order.paymentUrl;
      } else {
          // Redirect to account orders tab if no payment URL (e.g. COD)
          setTimeout(() => {
            history.push('/account');
          }, 1500);
      }
    } catch (err) {
      displayActionMessage(err.message || 'Đặt hàng thất bại', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!shipping || !shipping.isDone) {
    return <Redirect to={CHECKOUT_STEP_1} />;
  }

  return (
    <div className="checkout">
      <StepTracker current={3} />
      <Formik
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        onSubmit={onConfirm}
      >
        {({ isSubmitting }) => (
          <Form className="checkout-step-3">
            <VNPayPayment />
            <Total
              isInternational={shipping.isInternational}
              subtotal={subtotal}
            />
            {isPlacingOrder && (
              <div style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                Đang xử lý đơn hàng...
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

Payment.propTypes = {
  shipping: PropType.shape({
    isDone: PropType.bool,
    isInternational: PropType.bool,
    fullname: PropType.string,
    address: PropType.string,
    mobile: PropType.object,
  }).isRequired,
  payment: PropType.shape({
    name: PropType.string,
    cardnumber: PropType.string,
    expiry: PropType.string,
    ccv: PropType.string,
    type: PropType.string
  }).isRequired,
  subtotal: PropType.number.isRequired,
  profile: PropType.object,
};

Payment.defaultProps = {
  profile: {},
};

export default withCheckout(Payment);
