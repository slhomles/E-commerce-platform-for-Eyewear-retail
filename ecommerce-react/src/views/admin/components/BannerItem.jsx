import PropType from 'prop-types';
import React, { useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const statusLabels = {
  ACTIVE: 'Active',
  SCHEDULED: 'Scheduled',
  EXPIRED: 'Expired',
  DISABLED: 'Disabled',
};

const linkTypeLabels = {
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  CUSTOM_URL: 'Custom URL',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const BannerItem = ({ banner, onEdit, onDelete, onToggle }) => {
  const itemRef = useRef(null);

  const onConfirmDelete = () => {
    itemRef.current.classList.remove('item-active');
    onDelete(banner.id);
  };

  const onCancelDelete = () => {
    itemRef.current.classList.remove('item-active');
  };

  const onClickDelete = () => {
    itemRef.current.classList.toggle('item-active');
  };

  return (
    <SkeletonTheme color="#e1e1e1" highlightColor="#f2f2f2">
      <div
        className={`item item-products ${!banner.id && 'item-loading'}`}
        ref={itemRef}
      >
        <div className="grid grid-count-6">
          <div className="grid-col item-img-wrapper">
            {banner.imageUrl
              ? <img alt={banner.title} className="item-img" src={banner.imageUrl} />
              : <Skeleton height={50} width={80} />}
          </div>
          <div className="grid-col">
            <span className="text-overflow-ellipsis">
              {banner.title || <Skeleton width={100} />}
            </span>
            {banner.subtitle && (
              <span style={{ display: 'block', fontSize: '1.1rem' }}>
                {banner.subtitle}
              </span>
            )}
          </div>
          <div className="grid-col">
            <span>{banner.linkType ? linkTypeLabels[banner.linkType] : <Skeleton width={60} />}</span>
          </div>
          <div className="grid-col">
            {banner.displayStatus
              ? (
                <span className={
                  banner.displayStatus === 'ACTIVE' ? 'badge badge-success'
                  : banner.displayStatus === 'EXPIRED' || banner.displayStatus === 'DISABLED' ? 'badge badge-danger'
                  : 'badge'
                }>
                  {statusLabels[banner.displayStatus]}
                </span>
              )
              : <Skeleton width={70} />}
          </div>
          <div className="grid-col">
            {banner.startDate
              ? (
                <span>
                  {formatDate(banner.startDate)}
                  <br />
                  {`→ ${formatDate(banner.endDate)}`}
                </span>
              )
              : <Skeleton width={80} />}
          </div>
          <div className="grid-col">
            <span>{banner.position !== undefined && banner.position !== null ? banner.position : <Skeleton width={20} />}</span>
          </div>
        </div>

        {banner.id && (
          <>
            <div className="item-action">
              <button
                className="button button-border button-small"
                onClick={() => onToggle(banner.id)}
                title={banner.isActive ? 'Disable' : 'Enable'}
                type="button"
              >
                {banner.isActive ? 'Disable' : 'Enable'}
              </button>
              &nbsp;
              <button
                className="button button-border button-small"
                onClick={() => onEdit(banner)}
                type="button"
              >
                Edit
              </button>
              &nbsp;
              <button
                className="button button-border button-small button-danger"
                onClick={onClickDelete}
                type="button"
              >
                Delete
              </button>
            </div>
            <div className="item-action-confirm">
              <h5>Are you sure you want to delete this banner?</h5>
              <button
                className="button button-small button-border"
                onClick={onCancelDelete}
                type="button"
              >
                No
              </button>
              &nbsp;
              <button
                className="button button-small button-danger"
                onClick={onConfirmDelete}
                type="button"
              >
                Yes
              </button>
            </div>
          </>
        )}
      </div>
    </SkeletonTheme>
  );
};

BannerItem.propTypes = {
  banner: PropType.shape({
    id: PropType.string,
    title: PropType.string,
    subtitle: PropType.string,
    imageUrl: PropType.string,
    linkType: PropType.string,
    displayStatus: PropType.string,
    isActive: PropType.bool,
    startDate: PropType.string,
    endDate: PropType.string,
    position: PropType.number
  }).isRequired,
  onDelete: PropType.func.isRequired,
  onEdit: PropType.func.isRequired,
  onToggle: PropType.func.isRequired
};

export default BannerItem;
