import { displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

const SHIPPING_FEE = 30000;

const ShippingTotal = ({ subtotal }) => {
  const { discountAmount = 0, voucherCode } = useSelector((state) => state.cart || {});
  const displaySubtotal = discountAmount > 0 ? subtotal - discountAmount : subtotal;

  return (
    <div className="checkout-total d-flex-end padding-right-m">
      <table>
        <tbody>
          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                Shipping Fee: &nbsp;
              </span>
            </td>
            <td>
              <h4 className="basket-total-amount text-subtle text-right margin-0 ">
                {displayMoney(SHIPPING_FEE)}
              </h4>
            </td>
          </tr>
          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                Subtotal: &nbsp;
              </span>
            </td>
            <td>
              <h4 className="basket-total-amount text-subtle text-right margin-0">
                {displayMoney(subtotal)}
              </h4>
            </td>
          </tr>
          {discountAmount > 0 && (
            <tr>
              <td>
                <span className="d-block margin-0 padding-right-s text-right" style={{ color: '#2e7d32' }}>
                  Discount ({voucherCode}): &nbsp;
                </span>
              </td>
              <td>
                <h4 className="basket-total-amount text-right margin-0" style={{ color: '#2e7d32' }}>
                  -{displayMoney(discountAmount)}
                </h4>
              </td>
            </tr>
          )}
          <tr>
            <td>
              <span className="d-block margin-0 padding-right-s text-right">
                Total: &nbsp;
              </span>
            </td>
            <td>
              <h2 className="basket-total-amount text-right">
                {displayMoney(Number(displaySubtotal) + SHIPPING_FEE)}
              </h2>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

ShippingTotal.propTypes = {
  subtotal: PropType.number.isRequired
};

export default ShippingTotal;
