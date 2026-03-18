import PropType from 'prop-types';
import React, { useState } from 'react';
import PriceRange from '@/components/common/PriceRange';

const OrderFilters = ({ closeModal, dispatchFilter, filter }) => {
  const [field, setField] = useState({
    status: filter.status || '',
    paymentStatus: filter.paymentStatus || '',
    minAmount: filter.minAmount || 0,
    maxAmount: filter.maxAmount || 5000000,
    sortBy: filter.sortBy || 'newest'
  });

  const onStatusChange = (e) => {
    setField({ ...field, status: e.target.value });
  };

  const onPaymentStatusChange = (e) => {
    setField({ ...field, paymentStatus: e.target.value });
  };

  const onSortChange = (e) => {
    setField({ ...field, sortBy: e.target.value });
  };

  const onPriceChange = (minVal, maxVal) => {
    setField({ ...field, minAmount: minVal, maxAmount: maxVal });
  };

  const onApplyFilter = () => {
    dispatchFilter(field);
    closeModal();
  };

  const onResetFilter = () => {
    const resetValues = {
      status: '',
      paymentStatus: '',
      minAmount: 0,
      maxAmount: 5000000,
      sortBy: 'newest'
    };
    setField(resetValues);
    dispatchFilter(resetValues);
    closeModal();
  };

  return (
    <div className="filters">
      <div className="filters-field">
        <span>Order Status</span>
        <br />
        <br />
        <select
          className="filters-brand"
          value={field.status}
          onChange={onStatusChange}
        >
          <option value="">All Status</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PACKING">PACKING</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <div className="filters-field">
        <span>Payment Status</span>
        <br />
        <br />
        <select
          className="filters-brand"
          value={field.paymentStatus}
          onChange={onPaymentStatusChange}
        >
          <option value="">All Payment Status</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>
      <div className="filters-field">
        <span>Sort By</span>
        <br />
        <br />
        <select
          className="filters-sort-by d-block"
          value={field.sortBy}
          onChange={onSortChange}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_desc">Amount: High - Low</option>
          <option value="amount_asc">Amount: Low - High</option>
        </select>
      </div>
      <div className="filters-field">
        <span>Amount Range</span>
        <br />
        <br />
        <PriceRange
          min={0}
          max={5000000}
          initMin={field.minAmount}
          initMax={field.maxAmount}
          isLoading={false}
          onPriceChange={onPriceChange}
          productsCount={10} // Dummy to enable
        />
      </div>
      <div className="filters-action">
        <button
          className="filters-button button button-small"
          onClick={onApplyFilter}
          type="button"
        >
          Apply filters
        </button>
        <button
          className="filters-button button button-border button-small"
          onClick={onResetFilter}
          type="button"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};

OrderFilters.propTypes = {
  closeModal: PropType.func.isRequired,
  dispatchFilter: PropType.func.isRequired,
  filter: PropType.object.isRequired
};

export default OrderFilters;
