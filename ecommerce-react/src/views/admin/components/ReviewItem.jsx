import { StarFilled } from '@ant-design/icons';
import { displayDate } from '@/helpers/utils';
import PropType from 'prop-types';
import React, { useRef, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';

const ReviewItem = ({ review, onDelete, index }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteConfirmRef = useRef(null);

  const toggleDeleteConfirm = () => {
    setIsDeleting(!isDeleting);
  };

  const handleDelete = () => {
    onDelete(review.id);
    setIsDeleting(false);
  };

  return (
    <div className="grid grid-product grid-count-7 ReviewItem-container">
      <div className="grid-col">
        <span className="text-tertiary">{index + 1}</span>
      </div>
      <div className="grid-col">
        <h5 className="margin-0 text-subtle">{review.userFullName || 'Anonymous'}</h5>
        <span className="text-micro text-italic">{review.userId}</span>
      </div>
      <div className="grid-col">
        <h5 className="margin-0 text-subtle">{review.productId}</h5>
        {review.isVerifiedPurchase && (
          <span className="text-micro text-success">
            <CheckOutlined /> Verified
          </span>
        )}
      </div>
      <div className="grid-col text-center">
        <div className="d-flex-center">
          <h5 className="margin-0">{review.rating}</h5>
          &nbsp;
          <StarFilled style={{ color: '#ffc107' }} />
        </div>
      </div>
      <div className="grid-col">
        <p className="text-micro margin-0" style={{ 
          maxWidth: '200px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {review.content}
        </p>
      </div>
      <div className="grid-col">
        <span className="text-subtle">{displayDate(review.createdAt)}</span>
      </div>
      <div className="grid-col">
        <div className="item-action">
          <button
            className="button button-border button-small button-danger"
            onClick={toggleDeleteConfirm}
            type="button"
          >
            {isDeleting ? 'Cancel' : 'Delete'}
          </button>
          {isDeleting && (
            <div className="item-action-confirm" ref={deleteConfirmRef} style={{ right: '0', top: '100%', zIndex: 10 }}>
              <button
                className="button button-small button-danger"
                onClick={handleDelete}
                type="button"
              >
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReviewItem.propTypes = {
  review: PropType.shape({
    id: PropType.string,
    userId: PropType.string,
    userFullName: PropType.string,
    productId: PropType.string,
    rating: PropType.number,
    content: PropType.string,
    isVerifiedPurchase: PropType.bool,
    createdAt: PropType.string
  }).isRequired,
  onDelete: PropType.func.isRequired,
  index: PropType.number.isRequired
};

export default ReviewItem;
