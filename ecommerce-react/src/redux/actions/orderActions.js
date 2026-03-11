// Order Redux Action Types
export const SET_ORDERS = 'SET_ORDERS';
export const SET_ORDER_DETAIL = 'SET_ORDER_DETAIL';
export const SET_ORDER_LOADING = 'SET_ORDER_LOADING';
export const PLACE_ORDER_SUCCESS = 'PLACE_ORDER_SUCCESS';
export const CLEAR_ORDERS = 'CLEAR_ORDERS';
export const SET_ORDER_ERROR = 'SET_ORDER_ERROR';

export const setOrders = (payload) => ({
  type: SET_ORDERS,
  payload // { orders: [], totalPages, totalElements, currentPage }
});

export const setOrderDetail = (order) => ({
  type: SET_ORDER_DETAIL,
  payload: order
});

export const setOrderLoading = (isLoading) => ({
  type: SET_ORDER_LOADING,
  payload: isLoading
});

export const placeOrderSuccess = (order) => ({
  type: PLACE_ORDER_SUCCESS,
  payload: order
});

export const clearOrders = () => ({
  type: CLEAR_ORDERS
});

export const setOrderError = (error) => ({
  type: SET_ORDER_ERROR,
  payload: error
});
