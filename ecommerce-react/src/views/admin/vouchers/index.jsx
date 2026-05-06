import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import api from '@/services/api';
import { displayActionMessage } from '@/helpers/utils';
import VouchersNavbar from '../components/VouchersNavbar';
import VouchersTable from '../components/VouchersTable';

const Vouchers = () => {
  useDocumentTitle('Voucher Management | Admin');
  useScrollTop();

  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalVouchers, setTotalVouchers] = useState(0);
  const [searchKey, setSearchKey] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetchVouchers(currentPage, searchKey, statusFilter);
  }, [currentPage, searchKey, statusFilter]);

  const fetchVouchers = async (page, keyword, status) => {
    setLoading(true);
    try {
      const data = await api.getAdminVouchers({
        page,
        size: pageSize,
        keyword: keyword || undefined,
        status: status || undefined,
      });
      setVouchers(data.content || []);
      setTotalVouchers(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Failed to fetch vouchers');
      setLoading(false);
    }
  };

  const onDeleteVoucher = async (id) => {
    try {
      await api.deleteVoucher(id);
      displayActionMessage('Voucher deleted/deactivated successfully', 'success');
      fetchVouchers(currentPage, searchKey, statusFilter);
    } catch (e) {
      displayActionMessage(e.message || 'Failed to delete voucher', 'error');
    }
  };

  const onToggleVoucher = async (id, active) => {
    try {
      await api.toggleVoucher(id, active);
      displayActionMessage(active ? 'Voucher activated' : 'Voucher deactivated', 'success');
      fetchVouchers(currentPage, searchKey, statusFilter);
    } catch (e) {
      displayActionMessage(e.message || 'Failed to toggle voucher', 'error');
    }
  };

  const onSearchChange = (e) => {
    setSearchKey(e.target.value);
    setCurrentPage(0);
  };

  const onStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  return (
    <Boundary>
      <div className="loader" style={{ display: isLoading ? 'flex' : 'none' }}>
        <div className="loader-renderer" />
      </div>
      <VouchersNavbar
        vouchersCount={vouchers.length}
        totalVouchersCount={totalVouchers}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
      <div className="product-admin-items">
        {error && <div className="loader">{error}</div>}
        <VouchersTable
          baseIndex={currentPage * pageSize}
          onDelete={onDeleteVoucher}
          onToggle={onToggleVoucher}
          vouchers={vouchers}
        />

        {totalPages > 1 && (
          <div className="d-flex-center margin-top-l">
            <button
              className="button button-small button-muted"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
              type="button"
            >
              Previous
            </button>
            <span className="margin-left-s margin-right-s">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              className="button button-small button-muted"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Boundary>
  );
};

export default withRouter(Vouchers);
