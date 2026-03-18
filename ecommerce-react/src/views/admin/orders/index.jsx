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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  
  const [filter, setFilter] = useState({
    status: '',
    paymentStatus: '',
    minAmount: 0,
    maxAmount: 5000000,
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchOrders({ keyword: searchKey, ...filter, page: currentPage });
  }, [searchKey, filter, currentPage]);

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = { 
        page: 0, 
        size: pageSize,
        ...params
      };
      
      const response = await api.getAdminOrders(queryParams);
      setOrders(response.orders || []);
      setTotal(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
      setTotal(0);
      setTotalPages(0);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  const onApplyFilter = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page on filter
  };

  return (
    <Boundary>
      <OrdersNavbar
        ordersCount={orders.length}
        totalOrdersCount={total}
        onSearchChange={handleSearchChange}
        onApplyFilter={onApplyFilter}
        filter={filter}
      />
      <div className="product-admin-items">
        <div className="product-list-wrapper">
          {loading ? (
            <div className="loader" style={{ minHeight: '80vh' }}>
               <h6>Loading Orders...</h6>
            </div>
          ) : orders.length > 0 ? (
             <>
               <OrdersTable orders={orders} />
               {totalPages > 1 && (
                  <div className="d-flex-center margin-top-l">
                    <button
                      className="button button-small button-muted"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      type="button"
                    >
                      Previous
                    </button>
                    <span className="margin-left-s margin-right-s">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      className="button button-small button-muted"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
               )}
             </>
          ) : (
             <MessageDisplay message="No orders found." />
          )}
        </div>
      </div>
    </Boundary>
  );
};

export default withRouter(Orders);
