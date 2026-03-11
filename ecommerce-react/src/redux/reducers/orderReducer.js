import {
    SET_ORDERS,
    SET_ORDER_DETAIL,
    SET_ORDER_LOADING,
    PLACE_ORDER_SUCCESS,
    CLEAR_ORDERS,
    SET_ORDER_ERROR
} from '../actions/orderActions';

const defaultState = {
    orders: [],
    orderDetail: null,
    isLoading: false,
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    lastPlacedOrder: null,
    error: null
};

const orderReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_ORDERS:
            return {
                ...state,
                orders: action.payload.orders,
                totalPages: action.payload.totalPages,
                totalElements: action.payload.totalElements,
                currentPage: action.payload.currentPage,
                isLoading: false,
                error: null
            };
        case SET_ORDER_DETAIL:
            return {
                ...state,
                orderDetail: action.payload,
                isLoading: false,
                error: null
            };
        case SET_ORDER_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null
            };
        case PLACE_ORDER_SUCCESS:
            return {
                ...state,
                lastPlacedOrder: action.payload,
                isLoading: false,
                error: null
            };
        case SET_ORDER_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };
        case CLEAR_ORDERS:
            return defaultState;
        default:
            return state;
    }
};

export default orderReducer;
