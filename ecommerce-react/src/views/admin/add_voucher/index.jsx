import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import { ADMIN_VOUCHERS } from '@/constants/routes';
import React from 'react';
import { useHistory } from 'react-router-dom';
import api from '@/services/api';
import { displayActionMessage } from '@/helpers/utils';
import VoucherForm from '../components/VoucherForm';

const AddVoucher = () => {
  useDocumentTitle('Add Voucher | Admin');
  useScrollTop();
  const history = useHistory();

  const handleSubmit = async (payload, setSubmitting) => {
    try {
      await api.createVoucher(payload);
      displayActionMessage('Voucher created successfully!', 'success');
      history.push(ADMIN_VOUCHERS);
    } catch (e) {
      displayActionMessage(e.message || 'Failed to create voucher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Boundary>
      <div className="product-form-container">
        <h3 className="product-form-title">Create New Voucher</h3>
        <VoucherForm onSubmit={handleSubmit} isEdit={false} />
      </div>
    </Boundary>
  );
};

export default AddVoucher;
