import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FiltersToggle } from '@/components/common';
import { ADD_ORDER } from '@/constants/routes';
import PropType from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

const OrdersNavbar = (props) => {
  const { ordersCount, totalOrdersCount, onSearchChange } = props;
  const history = useHistory();

  return (
    <div className="product-admin-header">
      <h3 className="product-admin-header-title">
        Orders &nbsp;
        (
        {`${ordersCount} / ${totalOrdersCount || 0}`}
        )
      </h3>
      <div className="searchbar">
        <SearchOutlined className="searchbar-icon" />
        <input
          className="search-input searchbar-input"
          onChange={onSearchChange}
          placeholder="Search orders by ID..."
          type="text"
        />
      </div>
      &nbsp;
      <FiltersToggle>
        <button className="button-muted button-small" type="button">
          <FilterOutlined />
          &nbsp;More Filters
        </button>
      </FiltersToggle>
      <button
        className="button button-small"
        onClick={() => history.push(ADD_ORDER)}
        type="button"
      >
        <PlusOutlined />
        &nbsp; Add New Order
      </button>
    </div>
  );
};

OrdersNavbar.propTypes = {
  ordersCount: PropType.number.isRequired,
  totalOrdersCount: PropType.number.isRequired,
  onSearchChange: PropType.func.isRequired
};

export default OrdersNavbar;
