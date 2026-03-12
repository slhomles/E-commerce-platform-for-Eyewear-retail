import { ImageLoader } from '@/components/common';
import { displayDate } from '@/helpers/utils';
import PropType from 'prop-types';
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { withRouter } from 'react-router-dom';

const UserItem = ({ user, onEdit, index }) => {
  return (
    <SkeletonTheme
      color="#e1e1e1"
      highlightColor="#f2f2f2"
    >
      <div className={`item item-products ${!user.id && 'item-loading'}`}>
        <div className="grid grid-count-7">
          <div className="grid-col">
            <span>{index || <Skeleton width={20} />}</span>
          </div>
          <div className="grid-col">
            <span className="text-overflow-ellipsis">{user.fullName || <Skeleton width={80} />}</span>
          </div>
          <div className="grid-col">
            <span className="text-overflow-ellipsis">{user.email || <Skeleton width={100} />}</span>
          </div>
          <div className="grid-col">
            <span>{user.role || <Skeleton width={50} />}</span>
          </div>
          <div className="grid-col">
            <span>
              {user.createdAt ? displayDate(user.createdAt) : <Skeleton width={60} />}
            </span>
          </div>
          <div className="grid-col">
            <span className={`badge badge-${user.enabled ? 'success' : 'danger'}`}>
              {user.id ? (user.enabled ? 'Active' : 'Disabled') : <Skeleton width={40} />}
            </span>
          </div>
          <div className="grid-col">
            {user.id && (
                <button
                    className="button button-border button-small"
                    onClick={() => onEdit(user)}
                    type="button"
                >
                    Edit
                </button>
            )}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

UserItem.propTypes = {
  index: PropType.number,
  onEdit: PropType.func.isRequired,
  user: PropType.shape({
    id: PropType.string,
    fullName: PropType.string,
    email: PropType.string,
    role: PropType.string,
    avatar: PropType.string,
    enabled: PropType.bool,
    createdAt: PropType.string
  }).isRequired
};

export default withRouter(UserItem);
