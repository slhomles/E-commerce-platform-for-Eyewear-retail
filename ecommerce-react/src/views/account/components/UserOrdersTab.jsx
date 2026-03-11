import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/services/api';
import { setOrders, setOrderLoading, setOrderError } from '@/redux/actions/orderActions';
import { displayMoney } from '@/helpers/utils';
import ReviewModal from './ReviewModal';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'PACKING', label: 'Đang đóng gói' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_COLORS = {
  PENDING: '#f0ad4e',
  PAID: '#5cb85c',
  PACKING: '#5bc0de',
  SHIPPING: '#0275d8',
  DELIVERED: '#28a745',
  CANCELLED: '#d9534f',
};

const UserOrdersTab = () => {
  const dispatch = useDispatch();
  const { orders, totalPages, currentPage, isLoading, error } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [reviewOrderId, setReviewOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    dispatch(setOrderLoading(true));
    try {
      const result = await api.getMyOrders({
        status: statusFilter || undefined,
        page,
        size: 10,
        sortBy: 'newest',
      });
      dispatch(setOrders({
        orders: result.orders,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        currentPage: result.currentPage,
      }));
    } catch (err) {
      dispatch(setOrderError(err.message || 'Failed to load orders'));
    }
  }, [dispatch, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await api.cancelOrder(orderId);
      fetchOrders(); // Reload
    } catch (err) {
      alert(err.message || 'Cannot cancel order');
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="loader" style={{ minHeight: '80vh' }}>
        <h3>Đơn hàng của tôi</h3>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Đơn hàng của tôi</h3>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fee', borderRadius: '6px', color: '#d33', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <p style={{ fontSize: '16px' }}>Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '12px',
                background: '#fafafa',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{order.code}</span>
                  <span style={{ marginLeft: '12px', fontSize: '13px', color: '#888' }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff',
                    background: STATUS_COLORS[order.status] || '#999',
                  }}
                >
                  {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {order.totalItems} sản phẩm
                  {order.paymentMethod && (
                    <span style={{ marginLeft: '12px' }}>• {order.paymentMethod}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px', color: '#333' }}>
                    {displayMoney(order.finalAmount)}
                  </span>
                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      className="button button-small"
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        background: '#d9534f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Hủy
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button
                      type="button"
                      className="button button-small"
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        background: '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setReviewOrderId(order.id)}
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.5 : 1,
                  background: '#fff',
                }}
              >
                ← Trước
              </button>
              <span style={{ padding: '6px 14px', fontSize: '14px', color: '#666' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: '6px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                  background: '#fff',
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}

      {reviewOrderId && (
        <ReviewModal
          orderId={reviewOrderId}
          onClose={() => setReviewOrderId(null)}
          onSuccess={() => { }}
        />
      )}
    </div>
  );
};

export default UserOrdersTab;
