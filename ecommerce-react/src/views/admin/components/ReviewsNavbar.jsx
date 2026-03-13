import { SearchOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';

const ReviewsNavbar = (props) => {
  const { reviewsCount, totalReviewsCount, onSearchChange } = props;

  return (
    <div className="product-admin-header">
      <h3 className="product-admin-header-title">
        Reviews &nbsp;
        (
        {`${reviewsCount} / ${totalReviewsCount || 0}`}
        )
      </h3>
      <div className="searchbar">
        <SearchOutlined className="searchbar-icon" />
        <input
          className="search-input searchbar-input"
          onChange={onSearchChange}
          placeholder="Search reviews..."
          type="text"
        />
      </div>
    </div>
  );
};

ReviewsNavbar.propTypes = {
  reviewsCount: PropType.number.isRequired,
  totalReviewsCount: PropType.number.isRequired,
  onSearchChange: PropType.func.isRequired
};

export default ReviewsNavbar;
