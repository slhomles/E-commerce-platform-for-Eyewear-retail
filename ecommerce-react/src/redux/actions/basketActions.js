import {
  ADD_QTY_ITEM, ADD_TO_BASKET,
  CLEAR_BASKET,
  MINUS_QTY_ITEM, REMOVE_FROM_BASKET,
  SET_BASKET_ITEMS, SET_QTY_ITEM,
  TOGGLE_BASKET_ITEM_SELECT,
  TOGGLE_ALL_BASKET_ITEMS_SELECT,
  REMOVE_SELECTED_FROM_BASKET
} from '@/constants/constants';

export const setBasketItems = (items = []) => ({
  type: SET_BASKET_ITEMS,
  payload: items
});

export const addToBasket = (product) => ({
  type: ADD_TO_BASKET,
  payload: product
});

export const removeFromBasket = (id) => ({
  type: REMOVE_FROM_BASKET,
  payload: id
});

export const clearBasket = () => ({
  type: CLEAR_BASKET
});

export const addQtyItem = (id) => ({
  type: ADD_QTY_ITEM,
  payload: id
});

export const minusQtyItem = (id) => ({
  type: MINUS_QTY_ITEM,
  payload: id
});

export const setQtyItem = (id, qty) => ({
  type: SET_QTY_ITEM,
  payload: { id, qty }
});

export const toggleBasketItemSelect = (id) => ({
  type: TOGGLE_BASKET_ITEM_SELECT,
  payload: id
});

export const toggleAllBasketItemsSelect = () => ({
  type: TOGGLE_ALL_BASKET_ITEMS_SELECT
});

export const removeSelectedFromBasket = () => ({
  type: REMOVE_SELECTED_FROM_BASKET
});
