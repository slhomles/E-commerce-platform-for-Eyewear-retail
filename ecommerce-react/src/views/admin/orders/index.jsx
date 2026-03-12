/* eslint-disable react/jsx-props-no-spreading */
import { Boundary, MessageDisplay } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { OrdersNavbar, OrdersTable } from '../components';
import api from '@/services/api';

const Orders = () => {
  useDocumentTitle('Order List | Salinaka Admin');
  useScrollTop();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    fetchOrders(searchKey);
  }, [searchKey]);

  const fetchOrders = async (keyword) => {
    setLoading(true);
    try {
      const filters = { page: 0, size: 20 };
      if (keyword) {
        filters.keyword = keyword;
      }
      const response = await api.getAdminOrders(filters);
      // Giả sử API trả về định dạng Pagination:
      setOrders(response.orders || []);
      setTotal(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      // Fallback cho quá trình test chưa có API
      setOrders([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  return (
    <Boundary>
      <OrdersNavbar
        ordersCount={orders.length}
        totalOrdersCount={total}
        onSearchChange={handleSearchChange}
      />
      <div className="product-admin-items">
        <div className="product-list-wrapper">
          {loading ? (
            <div className="loader" style={{ minHeight: '80vh' }}>
               <h6>Loading Orders...</h6>
            </div>
          ) : orders.length > 0 ? (
             <OrdersTable orders={orders} />
          ) : (
             <MessageDisplay message="No orders found." />
          )}
        </div>
      </div>
    </Boundary>
  );
};

export default withRouter(Orders);
