import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Modal } from '@/components/common';
import { ADD_ORDER } from '@/constants/routes';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import OrderFilters from './OrderFilters';

const OrdersNavbar = (props) => {
  const { ordersCount, totalOrdersCount, onSearchChange, onApplyFilter, filter } = props;
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      <button className="button-muted button-small" type="button" onClick={openModal}>
        <FilterOutlined />
        &nbsp;More Filters
      </button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
      >
        <div className="filters-toggle-sub">
          <OrderFilters 
            closeModal={closeModal} 
            dispatchFilter={onApplyFilter}
            filter={filter}
          />
        </div>
        <button
          className="modal-close-button"
          onClick={closeModal}
          type="button"
        >
          <i className="fa fa-times-circle" />
        </button>
      </Modal>
      &nbsp;
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
  onSearchChange: PropType.func.isRequired,
  onApplyFilter: PropType.func.isRequired,
  filter: PropType.object.isRequired
};

export default OrdersNavbar;
