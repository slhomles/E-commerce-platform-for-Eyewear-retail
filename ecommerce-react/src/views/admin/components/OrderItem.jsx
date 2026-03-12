import { displayActionMessage, displayDate, displayMoney } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useDispatch } from 'react-redux';
import { useHistory, withRouter } from 'react-router-dom';
import api from '@/services/api';
import Modal from '@/components/common/Modal';

const OrderItem = ({ order }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const orderRef = useRef(null);

  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [isModalOpen, setModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
  }, [order.status, order.paymentStatus]);

  const onClickEdit = async () => {
    setModalOpen(true);
    if (!orderDetails) {
      setLoadingDetails(true);
      try {
        const data = await api.getAdminOrderDetail(order.id);
        if (data && data.success) {
           setOrderDetails(data.data);
        } else {
           setOrderDetails(data); // If the wrapper API structure is direct
        }
      } catch (err) {
        displayActionMessage('Failed to fetch order details');
      }
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onUpdateStatus = async (updates) => {
    try {
      await api.updateOrderStatus(order.id, updates);
      if (updates.status) setStatus(updates.status);
      if (updates.paymentStatus) setPaymentStatus(updates.paymentStatus);
      displayActionMessage('Order updated successfully');
    } catch (err) {
      displayActionMessage('Failed to update order');
    }
    orderRef.current.classList.remove('item-active');
  };

  const onDeleteOrder = () => {
    orderRef.current.classList.toggle('item-active');
  };

  const onCancelDelete = () => {
    orderRef.current.classList.remove('item-active');
  };

  const onConfirmDelete = async () => {
    try {
      await api.deleteOrder(order.id);
      displayActionMessage('Order deleted successfully');
      orderRef.current.classList.add('d-none'); // Hide row since we don't naturally refetch here
    } catch (err) {
      displayActionMessage('Failed to delete order');
    }
    orderRef.current.classList.remove('item-active');
  };

  return (
    <SkeletonTheme color="#e1e1e1" highlightColor="#f2f2f2">
      <div className={`item ${!order.id && 'item-loading'}`} ref={orderRef} style={{ borderBottom: '1px solid #e1e1e1', padding: '10px 0' }}>
        <div className="grid grid-count-7" style={{ alignItems: 'center' }}>
          <div className="grid-col">
            <span className="text-overflow-ellipsis">{order.code || <Skeleton width={50} />}</span>
          </div>
          <div className="grid-col">
            <span className="text-overflow-ellipsis">{order.userFullName || <Skeleton width={50} />}</span>
          </div>
          
          <div className="grid-col">
            {order.id ? (
              <select
                className="d-block"
                style={{ padding: '6px 8px' }}
                value={status}
                onChange={(e) => onUpdateStatus({ status: e.target.value })}
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="PACKING">PACKING</option>
                <option value="SHIPPING">SHIPPING</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            ) : <Skeleton width={50} />}
          </div>
          
          <div className="grid-col">
            {order.id ? (
              <select
                className="d-block"
                style={{ padding: '6px 8px' }}
                value={paymentStatus}
                onChange={(e) => onUpdateStatus({ paymentStatus: e.target.value })}
              >
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            ) : <Skeleton width={50} />}
          </div>

          <div className="grid-col">
            <span>{order.finalAmount ? displayMoney(order.finalAmount) : <Skeleton width={30} />}</span>
          </div>
          <div className="grid-col">
            <span>
              {order.createdAt ? displayDate(order.createdAt) : <Skeleton width={30} />}
            </span>
          </div>
          
          {/* Cột 7: Actions */}
          <div className="grid-col item-action-grid flex-justify-end d-flex-center">
            {order.id && (
              <>
                <button
                  className="button button-border button-small"
                  onClick={onClickEdit}
                  type="button"
                  style={{ marginRight: '5px' }}
                >
                  View
                </button>
                <button
                  className="button button-border button-small button-danger"
                  onClick={onDeleteOrder}
                  type="button"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Delete
                </button>
                <div className="item-action-confirm" style={{ right: 0, top: '100%', padding: '10px' }}>
                  <h5 style={{ fontSize: '12px' }}>Confirm Delete?</h5>
                  <button className="button button-small button-border" onClick={onCancelDelete} type="button">No</button>
                  &nbsp;
                  <button className="button button-small button-danger" onClick={onConfirmDelete} type="button">Yes</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chi tiết đơn hàng */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} overrideStyle={{ width: '80%', maxWidth: '900px' }}>
        <div style={{ padding: '10px' }}>
          <div className="d-flex" style={{ justifyContent: 'space-between', borderBottom: '1px solid #e1e1e1', paddingBottom: '15px', marginBottom: '15px' }}>
             <h3>Order Details {order.code && `- ${order.code}`}</h3>
             <button className="button button-border button-small" onClick={closeModal} type="button">Close</button>
          </div>
          
          {loadingDetails ? (
            <p>Loading details...</p>
          ) : orderDetails ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <p><strong>Customer:</strong> {order.userFullName}</p>
                  <p><strong>Note:</strong> {orderDetails.customerNote || 'None'}</p>
                </div>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <p><strong>Shipping Info:</strong></p>
                  <p>{orderDetails.shippingAddress ? `${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.wardName}, ${orderDetails.shippingAddress.districtName}, ${orderDetails.shippingAddress.provinceName}` : 'N/A'}</p>
                </div>
              </div>

              <h4>Products</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f2f2f2', borderBottom: '1px solid #e1e1e1' }}>
                    <th style={{ padding: '10px' }}>Product</th>
                    <th style={{ padding: '10px' }}>Unit Price</th>
                    <th style={{ padding: '10px' }}>Qty</th>
                    <th style={{ padding: '10px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.items && orderDetails.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e1e1e1' }}>
                      <td style={{ padding: '10px' }}>{item.productName}</td>
                      <td style={{ padding: '10px' }}>{displayMoney(item.unitPrice)}</td>
                      <td style={{ padding: '10px' }}>{item.quantity}</td>
                      <td style={{ padding: '10px' }}>{displayMoney(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <p><strong>Shipping Fee:</strong> {displayMoney(orderDetails.shippingFee || 0)}</p>
                <p><strong>Discount (Voucher):</strong> - {displayMoney(orderDetails.discountAmount || 0)}</p>
                <h3 style={{ margin: '10px 0 0 0' }}>Total: {displayMoney(orderDetails.finalAmount)}</h3>
              </div>
            </div>
          ) : (
            <p>Details not available.</p>
          )}
        </div>
      </Modal>

    </SkeletonTheme>
  );
};

OrderItem.propTypes = {
  order: PropType.shape({
    id: PropType.string,
    code: PropType.string,
    userFullName: PropType.string,
    status: PropType.string,
    paymentStatus: PropType.string,
    finalAmount: PropType.number,
    createdAt: PropType.number
  }).isRequired
};

export default withRouter(OrderItem);
