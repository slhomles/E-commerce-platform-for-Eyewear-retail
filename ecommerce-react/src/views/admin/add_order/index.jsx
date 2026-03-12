import { LoadingOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { lazy, Suspense } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { ADMIN_ORDERS } from '@/constants/routes';
import { displayActionMessage } from '@/helpers/utils';
// import api from '@/services/api';

const OrderForm = lazy(() => import('../components/OrderForm'));

const AddOrder = () => {
  useScrollTop();
  useDocumentTitle('Add New Order | Salinaka Admin');
  const history = useHistory();
  // using app loading state or local state
  const isLoading = false;

  const onSubmit = async (orderData) => {
    try {
      // Mock API trigger since we might not have a full "Admin Create Order" backend endpoint yet
      // await api.placeOrder(orderData); 
      console.log('Order submitted (mock):', orderData);
      displayActionMessage('Order creation submitted successfully.');
      setTimeout(() => history.push(ADMIN_ORDERS), 1500);
    } catch (err) {
      displayActionMessage('Failed to create order', 'error');
    }
  };

  return (
    <div className="product-form-container">
      <h2>Add New Order</h2>
      <Suspense fallback={(
        <div className="loader" style={{ minHeight: '80vh' }}>
          <h6>Loading ... </h6>
          <br />
          <LoadingOutlined />
        </div>
      )}
      >
        <OrderForm
          isLoading={isLoading}
          onSubmit={onSubmit}
        />
      </Suspense>
    </div>
  );
};

export default withRouter(AddOrder);
