import { FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Modal } from '@/components/common';
import { ADD_PRODUCT } from '@/constants/routes';
import PropType from 'prop-types';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ProductFilters from './ProductFilters';

const ProductsNavbar = (props) => {
  const {
    productsCount, totalProductsCount, onSearchChange, onApplyFilter, filter, onImportClick
  } = props;
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="product-admin-header">
      <h3 className="product-admin-header-title">
        Products &nbsp;
        (
        {`${productsCount} / ${totalProductsCount}`}
        )
      </h3>
      <div className="searchbar">
        <SearchOutlined className="searchbar-icon" />
        <input
          className="search-input searchbar-input"
          onChange={onSearchChange}
          placeholder="Search products..."
          type="text"
        />
      </div>
      &nbsp;
      <button className="button-muted button-small" type="button" onClick={openModal}>
        <FilterOutlined />
        &nbsp;More Filters
      </button>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <div className="filters-toggle-sub">
          <ProductFilters
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
        className="button button-small button-muted"
        onClick={onImportClick}
        type="button"
      >
        <PlusOutlined />
        &nbsp; Import Excel
      </button>
      &nbsp;
      <button
        className="button button-small"
        onClick={() => history.push(ADD_PRODUCT)}
        type="button"
      >
        <PlusOutlined />
        &nbsp; Add New Product
      </button>
    </div>
  );
};

ProductsNavbar.propTypes = {
  productsCount: PropType.number.isRequired,
  totalProductsCount: PropType.number.isRequired,
  onSearchChange: PropType.func.isRequired,
  onApplyFilter: PropType.func.isRequired,
  onImportClick: PropType.func.isRequired,
  filter: PropType.object.isRequired
};

export default ProductsNavbar;
