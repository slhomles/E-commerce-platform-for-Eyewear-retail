import {
  ADD_QTY_ITEM, ADD_TO_BASKET,
  CLEAR_BASKET,
  MINUS_QTY_ITEM, REMOVE_FROM_BASKET,
  SET_BASKET_ITEMS, SET_QTY_ITEM,
  TOGGLE_BASKET_ITEM_SELECT,
  TOGGLE_ALL_BASKET_ITEMS_SELECT,
  REMOVE_SELECTED_FROM_BASKET
} from '@/constants/constants';

export default (state = [], action) => {
  switch (action.type) {
    case SET_BASKET_ITEMS:
      return action.payload;
    case ADD_TO_BASKET:
      return state.some((product) => product.id === action.payload.id)
        ? state
        : [{ ...action.payload, selected: true }, ...state];
    case REMOVE_FROM_BASKET:
      return state.filter((product) => product.id !== action.payload);
    case CLEAR_BASKET:
      return [];
    case ADD_QTY_ITEM:
      return state.map((product) => {
        if (product.id === action.payload) {
          return {
            ...product,
            quantity: product.quantity + 1
          };
        }
        return product;
      });
    case MINUS_QTY_ITEM:
      return state.map((product) => {
        if (product.id === action.payload) {
          return {
            ...product,
            quantity: product.quantity - 1
          };
        }
        return product;
      });
    case SET_QTY_ITEM:
      return state.map((product) => {
        if (product.id === action.payload.id) {
          return {
            ...product,
            quantity: action.payload.qty
          };
        }
        return product;
      });
    case TOGGLE_BASKET_ITEM_SELECT:
      return state.map((product) => {
        if (product.id === action.payload) {
          return {
            ...product,
            selected: !product.selected
          };
        }
        return product;
      });
    case TOGGLE_ALL_BASKET_ITEMS_SELECT: {
      const allSelected = state.every((product) => product.selected);
      return state.map((product) => ({
        ...product,
        selected: !allSelected
      }));
    }
    case REMOVE_SELECTED_FROM_BASKET:
      return state.filter((product) => !product.selected);
    default:
      return state;
  }
};
