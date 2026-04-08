import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import api from '@/services/api';
import BannersNavbar from '../components/BannersNavbar';
import BannersTable from '../components/BannersTable';
import BannerForm from '../components/BannerForm';

const Banners = () => {
  useDocumentTitle('Banner Management | Admin');
  useScrollTop();

  const [banners, setBanners] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const pageSize = 20;

  const fetchBanners = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const data = await api.getAdminBanners(page, pageSize);
      setBanners(data?.content || []);
      setTotal(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (e) {
      console.error('Failed to fetch banners', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners(currentPage);
  }, [currentPage, fetchBanners]);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleFormSubmit = async (payload) => {
    setFormLoading(true);
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
      } else {
        await api.createBanner(payload);
      }
      setShowForm(false);
      setEditingBanner(null);
      fetchBanners(currentPage);
    } catch (err) {
      console.error('Banner save failed', err);
      alert('Failed to save banner: ' + (err?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteBanner(id);
      fetchBanners(currentPage);
    } catch (err) {
      console.error('Delete banner failed', err);
      alert('Failed to delete banner.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleBanner(id);
      fetchBanners(currentPage);
    } catch (err) {
      console.error('Toggle banner failed', err);
    }
  };

  return (
    <Boundary>
      <BannersNavbar
        bannersCount={total}
        onAddBanner={handleAddBanner}
      />
      <div className="product-admin-items">
        <div className="product-list-wrapper">
          {isLoading ? (
            <div className="loader" style={{ minHeight: '60vh' }}>
              <h6>Loading Banners...</h6>
            </div>
          ) : (
            <>
              <BannersTable
                banners={banners}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
              {totalPages > 1 && (
                <div className="d-flex-center margin-top-l">
                  <button
                    className="button button-small button-muted"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
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
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BannerForm
        banner={editingBanner}
        isLoading={formLoading}
        isOpen={showForm}
        onCancel={() => { setShowForm(false); setEditingBanner(null); }}
        onSubmit={handleFormSubmit}
      />
    </Boundary>
  );
};

export default withRouter(Banners);
