import { EditOutlined } from '@ant-design/icons';
import * as ROUTES from '@/constants/routes';
import PropType from 'prop-types';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

const statusColors = {
  ACTIVE: { bg: '#e6f7e6', color: '#2e7d32' },
  INACTIVE: { bg: '#f5f5f5', color: '#757575' },
  EXPIRED: { bg: '#fce4ec', color: '#c62828' },
  UPCOMING: { bg: '#e3f2fd', color: '#1565c0' },
  DEPLETED: { bg: '#fff3e0', color: '#e65100' },
};

const formatDiscount = (type, value) => {
  if (type === 'PERCENTAGE') return `${value}%`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const VoucherItem = ({ voucher, onDelete, onToggle, index }) => {
  const history = useHistory();
  const [isDeleting, setIsDeleting] = useState(false);
  const statusStyle = statusColors[voucher.status] || statusColors.INACTIVE;

  return (
    <div className="grid grid-product grid-count-7" style={{ padding: '10px 20px', alignItems: 'center' }}>
      <div className="grid-col">
        <span className="text-tertiary">{index + 1}</span>
      </div>
      <div className="grid-col">
        <h5 className="margin-0" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
          {voucher.code}
        </h5>
        {voucher.description && (
          <span className="text-micro text-subtle" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {voucher.description}
          </span>
        )}
      </div>
      <div className="grid-col">
        <span style={{ fontWeight: 'bold', color: '#e65100' }}>
          {formatDiscount(voucher.discountType, voucher.discountValue)}
        </span>
        {voucher.minOrderAmount > 0 && (
          <span className="text-micro text-subtle" style={{ display: 'block' }}>
            Min: {new Intl.NumberFormat('vi-VN').format(voucher.minOrderAmount)}
          </span>
        )}
      </div>
      <div className="grid-col">
        <span>
          {voucher.usedCount || 0}
          {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ' / \u221E'}
        </span>
        {voucher.perUserLimit && (
          <span className="text-micro text-subtle" style={{ display: 'block' }}>
            {voucher.perUserLimit}/user
          </span>
        )}
      </div>
      <div className="grid-col">
        <span className="text-micro">
          {formatDate(voucher.startDate)}
        </span>
        <span className="text-micro" style={{ display: 'block' }}>
          {formatDate(voucher.endDate)}
        </span>
      </div>
      <div className="grid-col">
        <span style={{
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          backgroundColor: statusStyle.bg,
          color: statusStyle.color,
        }}>
          {voucher.status}
        </span>
      </div>
      <div className="grid-col">
        <div className="item-action" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="button button-border button-small"
            onClick={() => history.push(`${ROUTES.EDIT_VOUCHER}/${voucher.id}`)}
            type="button"
            title="Edit"
          >
            <EditOutlined />
          </button>
          <button
            className={`button button-small ${voucher.isActive ? 'button-border button-muted' : 'button-border'}`}
            onClick={() => onToggle(voucher.id, !voucher.isActive)}
            type="button"
            title={voucher.isActive ? 'Deactivate' : 'Activate'}
          >
            {voucher.isActive ? 'Off' : 'On'}
          </button>
          <button
            className="button button-border button-small button-danger"
            onClick={() => setIsDeleting(!isDeleting)}
            type="button"
          >
            {isDeleting ? 'Cancel' : 'Del'}
          </button>
          {isDeleting && (
            <button
              className="button button-small button-danger"
              onClick={() => { onDelete(voucher.id); setIsDeleting(false); }}
              type="button"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

VoucherItem.propTypes = {
  voucher: PropType.object.isRequired,
  onDelete: PropType.func.isRequired,
  onToggle: PropType.func.isRequired,
  index: PropType.number.isRequired,
};

export default VoucherItem;
