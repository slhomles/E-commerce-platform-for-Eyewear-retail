/* eslint-disable no-nested-ternary */
import { SIGNIN } from '@/constants/routes';
import { calculateTotal } from '@/helpers/utils';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';

const withCheckout = (Component) => withRouter((props) => {
  const state = useSelector((store) => ({
    isAuth: !!store.auth?.id && !!store.auth?.role,
    basket: Array.isArray(store.basket) ? store.basket : [],
    shipping: store.checkout?.shipping || {},
    payment: store.checkout?.payment || {},
    profile: store.profile || {}
  }));

  // Only include selected items for checkout
  const selectedBasket = state.basket.filter((product) => product.selected !== false);
  // Subtotal = raw product total only (no shipping fee).
  // Each step's display component adds its own fixed shipping fee (30,000 VND).
  const subtotal = calculateTotal(selectedBasket.map((product) => (product.price || 0) * (product.quantity || 1)));

  if (!state.isAuth) {
    return <Redirect to={SIGNIN} />;
  } if (selectedBasket.length === 0) {
    return <Redirect to="/" />;
  } if (state.isAuth && selectedBasket.length !== 0) {
    return (
      <Component
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        basket={selectedBasket}
        payment={state.payment}
        profile={state.profile}
        shipping={state.shipping}
        subtotal={Number(subtotal)}
      />
    );
  }
  return null;
});

export default withCheckout;
