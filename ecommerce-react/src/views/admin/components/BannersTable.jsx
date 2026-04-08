import PropType from 'prop-types';
import React from 'react';
import BannerItem from './BannerItem';

const BannersTable = ({ banners, onEdit, onDelete, onToggle }) => (
  <div>
    {banners.length > 0 && (
      <div className="grid grid-product grid-count-6">
        <div className="grid-col" />
        <div className="grid-col">
          <h5>Title</h5>
        </div>
        <div className="grid-col">
          <h5>Link Type</h5>
        </div>
        <div className="grid-col">
          <h5>Status</h5>
        </div>
        <div className="grid-col">
          <h5>Schedule</h5>
        </div>
        <div className="grid-col">
          <h5>Position</h5>
        </div>
      </div>
    )}
    {banners.length === 0
      ? new Array(6).fill({}).map((_, index) => (
          <BannerItem
            banner={{}}
            key={`banner-skeleton-${index}`}
            onDelete={() => {}}
            onEdit={() => {}}
            onToggle={() => {}}
          />
        ))
      : banners.map((banner) => (
          <BannerItem
            banner={banner}
            key={banner.id}
            onDelete={onDelete}
            onEdit={onEdit}
            onToggle={onToggle}
          />
        ))}
  </div>
);

BannersTable.propTypes = {
  banners: PropType.array.isRequired,
  onDelete: PropType.func.isRequired,
  onEdit: PropType.func.isRequired,
  onToggle: PropType.func.isRequired
};

export default BannersTable;
