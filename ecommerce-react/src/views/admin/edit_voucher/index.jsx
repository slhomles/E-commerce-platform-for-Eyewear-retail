import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { ADMIN_VOUCHERS } from '@/constants/routes';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import api from '@/services/api';
import { displayActionMessage } from '@/helpers/utils';
import VoucherForm from '../components/VoucherForm';

const EditVoucher = () => {
  useDocumentTitle('Edit Voucher | Admin');
  useScrollTop();
  const history = useHistory();
  const { id } = useParams();

  const [voucher, setVoucher] = useState(null);
  const [usages, setUsages] = useState([]);
  const [usagesPage, setUsagesPage] = useState(0);
  const [usagesTotalPages, setUsagesTotalPages] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVoucher();
  }, [id]);

  useEffect(() => {
    if (voucher) loadUsages(usagesPage);
  }, [voucher, usagesPage]);

  const loadVoucher = async () => {
    try {
      const data = await api.getAdminVoucherDetail(id);
      setVoucher({
        ...data,
        applicableItemIds: (data.applicableItems || []).map(item => item.itemId),
      });
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Failed to load voucher');
      setLoading(false);
    }
  };

  const loadUsages = async (page) => {
    try {
      const data = await api.getVoucherUsages(id, page, 5);
      setUsages(data.content || []);
      setUsagesTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error('Failed to load usages', e);
    }
  };

  const handleSubmit = async (payload, setSubmitting) => {
    try {
      await api.updateVoucher(id, payload);
      displayActionMessage('Voucher updated successfully!', 'success');
      history.push(ADMIN_VOUCHERS);
    } catch (e) {
      displayActionMessage(e.message || 'Failed to update voucher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loader" style={{ display: 'flex' }}>
        <div className="loader-renderer" />
      </div>
    );
  }

  if (error) {
    return <div className="loader">{error}</div>;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <Boundary>
      <div className="product-form-container">
        <h3 className="product-form-title">
          Edit Voucher: <span style={{ fontFamily: 'monospace' }}>{voucher?.code}</span>
        </h3>
        <VoucherForm
          initialValues={voucher}
          onSubmit={handleSubmit}
          isEdit
        />

        {/* Usage History Section */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #e0e0e0', paddingTop: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>
            Usage History ({voucher?.usedCount || 0} total)
          </h4>
          {usages.length > 0 ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>#</th>
                    <th style={{ padding: '8px' }}>User</th>
                    <th style={{ padding: '8px' }}>Email</th>
                    <th style={{ padding: '8px' }}>Order Code</th>
                    <th style={{ padding: '8px' }}>Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.map((usage, idx) => (
                    <tr key={usage.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>{usagesPage * 5 + idx + 1}</td>
                      <td style={{ padding: '8px' }}>{usage.userFullName || 'Unknown'}</td>
                      <td style={{ padding: '8px' }}>{usage.userEmail || ''}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{usage.orderCode || '-'}</td>
                      <td style={{ padding: '8px' }}>{formatDate(usage.usedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usagesTotalPages > 1 && (
                <div className="d-flex-center margin-top-l">
                  <button
                    className="button button-small button-muted"
                    disabled={usagesPage === 0}
                    onClick={() => setUsagesPage(prev => prev - 1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <span className="margin-left-s margin-right-s">
                    Page {usagesPage + 1} of {usagesTotalPages}
                  </span>
                  <button
                    className="button button-small button-muted"
                    disabled={usagesPage >= usagesTotalPages - 1}
                    onClick={() => setUsagesPage(prev => prev + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-subtle">No usage records yet.</p>
          )}
        </div>
      </div>
    </Boundary>
  );
};

export default EditVoucher;
