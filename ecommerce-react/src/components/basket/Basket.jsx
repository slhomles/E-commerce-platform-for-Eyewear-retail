/* eslint-disable max-len */
import { BasketItem, BasketToggle } from '@/components/basket';
import { Boundary, Modal } from '@/components/common';
import { CHECKOUT_STEP_1 } from '@/constants/routes';
import { calculateTotal, displayMoney } from '@/helpers/utils';
import { useDidMount, useModal } from '@/hooks';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { clearBasket, toggleAllBasketItemsSelect, removeSelectedFromBasket } from '@/redux/actions/basketActions';

const Basket = () => {
  const { isOpenModal, onOpenModal, onCloseModal } = useModal();
  const { basket, user } = useSelector((state) => ({
    basket: state.basket,
    user: state.auth
  }));
  const history = useHistory();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const selectedItems = basket.filter((product) => product.selected !== false);
  const allSelected = basket.length > 0 && basket.every((product) => product.selected !== false);
  const hasSelected = selectedItems.length > 0;

  const onCheckOut = () => {
    if ((hasSelected && user)) {
      document.body.classList.remove('is-basket-open');
      history.push(CHECKOUT_STEP_1);
    } else {
      onOpenModal();
    }
  };

  const onSignInClick = () => {
    onCloseModal();
    document.body.classList.remove('basket-open');
    history.push(CHECKOUT_STEP_1);
  };

  const onClearBasket = () => {
    if (basket.length !== 0) {
      dispatch(clearBasket());
    }
  };

  const onToggleSelectAll = () => {
    dispatch(toggleAllBasketItemsSelect());
  };

  const onDeleteSelected = () => {
    if (hasSelected) {
      dispatch(removeSelectedFromBasket());
    }
  };

  return user && user.role === 'ADMIN' ? null : (
    <Boundary>
      <Modal
        isOpen={isOpenModal}
        onRequestClose={onCloseModal}
      >
        <p className="text-center">
          {!user
            ? 'You must sign in to continue checking out'
            : 'Please select at least one item to checkout'}
        </p>
        <br />
        <div className="d-flex-center">
          <button
            className="button button-border button-border-gray button-small"
            onClick={onCloseModal}
            type="button"
          >
            Continue shopping
          </button>
          {!user && (
            <>
              &nbsp;
              <button
                className="button button-small"
                onClick={onSignInClick}
                type="button"
              >
                Sign in to checkout
              </button>
            </>
          )}
        </div>
      </Modal>
      <div className="basket">
        <div className="basket-list">
          <div className="basket-header">
            <h3 className="basket-header-title">
              My Basket &nbsp;
              <span>
                (
                {` ${basket.length} ${basket.length > 1 ? 'items' : 'item'}`}
                )
              </span>
            </h3>
            <button
              className="basket-delete-selected button button-border button-small"
              disabled={!hasSelected}
              onClick={onDeleteSelected}
              type="button"
            >
              <span>Delete Selected</span>
            </button>
            <BasketToggle>
              {({ onClickToggle }) => (
                <span
                  className="basket-toggle button button-border button-border-gray button-small"
                  onClick={onClickToggle}
                  role="presentation"
                >
                  Close
                </span>
              )}
            </BasketToggle>
            <button
              className="basket-clear button button-border button-border-gray button-small"
              disabled={basket.length === 0}
              onClick={onClearBasket}
              type="button"
            >
              <span>Clear Basket</span>
            </button>
          </div>
          {basket.length > 0 && (
            <div className="basket-actions">
              <label className="basket-select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
                <span>Select All ({selectedItems.length}/{basket.length})</span>
              </label>
            </div>
          )}
          {basket.length <= 0 && (
            <div className="basket-empty">
              <h5 className="basket-empty-msg">Your basket is empty</h5>
            </div>
          )}
          {basket.map((product, i) => (
            <BasketItem
              // eslint-disable-next-line react/no-array-index-key
              key={`${product.id}_${i}`}
              product={product}
              basket={basket}
              dispatch={dispatch}
            />
          ))}
        </div>
        <div className="basket-checkout">
          <div className="basket-total">
            <p className="basket-total-title">
              Subtotal Amount
              {selectedItems.length < basket.length ? ` (${selectedItems.length} selected)` : ''}
              :
            </p>
            <h2 className="basket-total-amount">
              {displayMoney(calculateTotal(selectedItems.map((product) => product.price * product.quantity)))}
            </h2>
          </div>
          <button
            className="basket-checkout-button button"
            disabled={!hasSelected || pathname === '/checkout'}
            onClick={onCheckOut}
            type="button"
          >
            Check Out
          </button>
        </div>
      </div>
    </Boundary>
  );
};

export default Basket;
