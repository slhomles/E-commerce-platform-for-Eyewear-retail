import { Boundary, MessageDisplay } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import api from '@/services/api';
import { ProductsNavbar } from '../components';
import ProductsTable from '../components/ProductsTable';
import ImportModal from './ImportModal';

const Products = () => {
  useDocumentTitle('Product List | Salinaka Admin');
  useScrollTop();

  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const pageSize = 12;

  useEffect(() => {
    fetchProducts(currentPage, searchKey);
  }, [currentPage, searchKey]);

  const fetchProducts = async (page, keyword) => {
    setLoading(true);
    try {
      const data = await api.getAllProducts(page, pageSize, keyword);
      setProducts(data.content || []);
      setTotal(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
    setCurrentPage(0);
  };

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  return (
    <Boundary>
      <ProductsNavbar
        onSearchChange={handleSearchChange}
        productsCount={products.length}
        totalProductsCount={total}
        onImportClick={openImportModal}
      />
      <div className="product-admin-items">
        <div className="product-list-wrapper">
          {isLoading ? (
            <div className="loader" style={{ minHeight: '80vh' }}>
              <h6>Loading Products...</h6>
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductsTable filteredProducts={products} />
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
          ) : (
            <MessageDisplay message="No products found." />
          )}
        </div>
      </div>
      <ImportModal isOpen={isImportModalOpen} onRequestClose={closeImportModal} />
    </Boundary>
  );
};

export default withRouter(Products);
