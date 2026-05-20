import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { CHECKOUT_STEP_2 } from '@/constants/routes';
import { useFormikContext } from 'formik';
import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setPaymentDetails } from '@/redux/actions/checkoutActions';

const SHIPPING_FEE = 30000;

const Total = ({ subtotal }) => {
  const { values, submitForm } = useFormikContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const { discountAmount, voucherCode } = useSelector((state) => state.cart);
  const shippingFee = SHIPPING_FEE;

  const onClickBack = () => {
    // destructure to only select left fields omitting cardnumber and ccv
    const { cardnumber, ccv, ...rest } = values;

    dispatch(setPaymentDetails({ ...rest })); // save payment details
    history.push(CHECKOUT_STEP_2);
  };

  return (
    <>
      {discountAmount > 0 && (
        <div className="basket-total text-right">
          <p className="basket-total-title" style={{ color: '#2e7d32' }}>Discount ({voucherCode}):</p>
          <h4 className="basket-total-amount" style={{ color: '#2e7d32' }}>
            -{displayMoney(discountAmount)}
          </h4>
        </div>
      )}
      <div className="basket-total text-right">
        <p className="basket-total-title">Total:</p>
        <h2 className="basket-total-amount">
          {displayMoney(subtotal + shippingFee)}
        </h2>
      </div>
      <br />
      <div className="checkout-shipping-action">
        <button
          className="button button-muted"
          onClick={() => onClickBack(values)}
          type="button"
        >
          <ArrowLeftOutlined />
          &nbsp;
          Go Back
        </button>
        <button
          className="button"
          disabled={false}
          onClick={submitForm}
          type="button"
        >
          <CheckOutlined />
          &nbsp;
          Confirm
        </button>
      </div>
    </>
  );
};

Total.propTypes = {
  subtotal: PropType.number.isRequired
};

export default Total;
