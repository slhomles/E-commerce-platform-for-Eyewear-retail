import PropType from 'prop-types';
import React from 'react';
import ReviewItem from './ReviewItem';

const ReviewsTable = ({ reviews, onDelete, baseIndex }) => (
  <div className="product-admin-items">
    <div className="grid grid-product grid-count-7" style={{ padding: '10px 20px', fontWeight: 'bold' }}>
      <div className="grid-col">
        <span>#</span>
      </div>
      <div className="grid-col">
          <span>Customer</span>
      </div>
      <div className="grid-col">
          <span>Product ID</span>
      </div>
      <div className="grid-col text-center">
          <span>Rating</span>
      </div>
      <div className="grid-col">
          <span>Content</span>
      </div>
      <div className="grid-col">
          <span>Date</span>
      </div>
      <div className="grid-col">
          <span>Action</span>
      </div>
    </div>
    {reviews.length > 0 ? reviews.map((review, index) => (
      <ReviewItem
        key={review.id}
        review={review}
        onDelete={onDelete}
        index={baseIndex + index}
      />
    )) : (
        <div className="text-center padding-l">
            <h4>No reviews found.</h4>
        </div>
    )}
  </div>
);

ReviewsTable.propTypes = {
  reviews: PropType.array.isRequired,
  onDelete: PropType.func.isRequired,
  baseIndex: PropType.number.isRequired
};

export default ReviewsTable;
