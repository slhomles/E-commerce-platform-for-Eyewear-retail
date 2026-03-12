/* eslint-disable react/forbid-prop-types */
import PropType from 'prop-types';
import React from 'react';
import { OrderItem } from '.';

const OrdersTable = ({ orders }) => (
  <div>
    {orders.length > 0 && (
      <div className="grid grid-product grid-count-7">
        <div className="grid-col">
          <h5>Order Code</h5>
        </div>
        <div className="grid-col">
          <h5>Customer</h5>
        </div>
        <div className="grid-col">
          <h5>Status</h5>
        </div>
        <div className="grid-col">
          <h5>Payment</h5>
        </div>
        <div className="grid-col">
          <h5>Total Amount</h5>
        </div>
        <div className="grid-col">
          <h5>Date Added</h5>
        </div>
        <div className="grid-col">
          <h5 className="text-center">Actions</h5>
        </div>
      </div>
    )}
    {orders.length === 0 ? new Array(10).fill({}).map((order, index) => (
      <OrderItem
        // eslint-disable-next-line react/no-array-index-key
        key={`order-skeleton ${index}`}
        order={order}
      />
    )) : orders.map((order) => (
      <OrderItem
        key={order.id}
        order={order}
      />
    ))}
  </div>
);

OrdersTable.propTypes = {
  orders: PropType.array.isRequired
};

export default OrdersTable;
