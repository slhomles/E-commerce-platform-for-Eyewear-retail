import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import * as ROUTES from '@/constants/routes';
import PropType from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

const VouchersNavbar = ({ vouchersCount, totalVouchersCount, onSearchChange, statusFilter, onStatusFilterChange }) => {
  const history = useHistory();

  return (
    <div className="product-admin-header">
      <h3 className="product-admin-header-title">
        Vouchers &nbsp;
        ({`${vouchersCount} / ${totalVouchersCount || 0}`})
      </h3>
      <div className="d-flex" style={{ gap: '12px', alignItems: 'center' }}>
        <select
          className="search-input"
          value={statusFilter}
          onChange={onStatusFilterChange}
          style={{ padding: '8px 12px', minWidth: '140px' }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="EXPIRED">Expired</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="DEPLETED">Depleted</option>
        </select>
        <div className="searchbar">
          <SearchOutlined className="searchbar-icon" />
          <input
            className="search-input searchbar-input"
            onChange={onSearchChange}
            placeholder="Search by code or description..."
            type="text"
          />
        </div>
        <button
          className="button button-small"
          onClick={() => history.push(ROUTES.ADD_VOUCHER)}
          type="button"
        >
          <PlusOutlined /> &nbsp; Add Voucher
        </button>
      </div>
    </div>
  );
};

VouchersNavbar.propTypes = {
  vouchersCount: PropType.number.isRequired,
  totalVouchersCount: PropType.number.isRequired,
  onSearchChange: PropType.func.isRequired,
  statusFilter: PropType.string.isRequired,
  onStatusFilterChange: PropType.func.isRequired,
};

export default VouchersNavbar;
