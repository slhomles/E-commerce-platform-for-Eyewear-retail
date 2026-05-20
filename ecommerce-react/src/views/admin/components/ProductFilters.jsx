import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const ProductFilters = ({ closeModal, dispatchFilter, filter }) => {
  const [field, setField] = useState({
    brand: filter.brand || '',
    category: filter.category || '',
    sortBy: filter.sortBy || 'newest'
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getBrands().then((data) => setBrands(data)).catch(() => {});
    api.getCategories().then((data) => setCategories(data)).catch(() => {});
  }, []);

  const onApplyFilter = () => {
    dispatchFilter(field);
    closeModal();
  };

  const onResetFilter = () => {
    const resetValues = { brand: '', category: '', sortBy: 'newest' };
    setField(resetValues);
    dispatchFilter(resetValues);
    closeModal();
  };

  return (
    <div className="filters">
      <div className="filters-field">
        <span>Brand</span>
        <br />
        <br />
        <select
          className="filters-brand"
          value={field.brand}
          onChange={(e) => setField({ ...field, brand: e.target.value })}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="filters-field">
        <span>Category</span>
        <br />
        <br />
        <select
          className="filters-brand"
          value={field.category}
          onChange={(e) => setField({ ...field, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="filters-field">
        <span>Sort By</span>
        <br />
        <br />
        <select
          className="filters-sort-by d-block"
          value={field.sortBy}
          onChange={(e) => setField({ ...field, sortBy: e.target.value })}
        >
          <option value="newest">Newest First</option>
          <option value="name_asc">Name A - Z</option>
          <option value="name_desc">Name Z - A</option>
          <option value="price_asc">Price Low - High</option>
          <option value="price_desc">Price High - Low</option>
        </select>
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

ProductFilters.propTypes = {
  closeModal: PropType.func.isRequired,
  dispatchFilter: PropType.func.isRequired,
  filter: PropType.object.isRequired
};

export default ProductFilters;
