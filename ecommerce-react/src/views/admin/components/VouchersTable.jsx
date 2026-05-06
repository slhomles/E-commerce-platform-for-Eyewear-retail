import PropType from 'prop-types';
import React from 'react';
import VoucherItem from './VoucherItem';

const VouchersTable = ({ vouchers, onDelete, onToggle, baseIndex }) => (
  <div className="product-admin-items">
    <div className="grid grid-product grid-count-7" style={{ padding: '10px 20px', fontWeight: 'bold' }}>
      <div className="grid-col">
        <span>#</span>
      </div>
      <div className="grid-col">
        <span>Code</span>
      </div>
      <div className="grid-col">
        <span>Discount</span>
      </div>
      <div className="grid-col">
        <span>Usage</span>
      </div>
      <div className="grid-col">
        <span>Period</span>
      </div>
      <div className="grid-col">
        <span>Status</span>
      </div>
      <div className="grid-col">
        <span>Actions</span>
      </div>
    </div>
    {vouchers.length > 0 ? vouchers.map((voucher, index) => (
      <VoucherItem
        key={voucher.id}
        voucher={voucher}
        onDelete={onDelete}
        onToggle={onToggle}
        index={baseIndex + index}
      />
    )) : (
      <div className="text-center padding-l">
        <h4>No vouchers found.</h4>
      </div>
    )}
  </div>
);

VouchersTable.propTypes = {
  vouchers: PropType.array.isRequired,
  onDelete: PropType.func.isRequired,
  onToggle: PropType.func.isRequired,
  baseIndex: PropType.number.isRequired,
};

export default VouchersTable;
