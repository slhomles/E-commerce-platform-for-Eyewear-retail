import { PlusOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';

const BannersNavbar = ({ bannersCount, onAddBanner }) => (
  <div className="product-admin-header">
    <h3 className="product-admin-header-title">
      Banners &nbsp;({bannersCount})
    </h3>
    <button
      className="button button-small"
      onClick={onAddBanner}
      type="button"
    >
      <PlusOutlined />
      &nbsp; Add Banner
    </button>
  </div>
);

BannersNavbar.propTypes = {
  bannersCount: PropType.number.isRequired,
  onAddBanner: PropType.func.isRequired
};

export default BannersNavbar;
