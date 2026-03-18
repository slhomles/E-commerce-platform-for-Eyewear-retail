/* eslint-disable react/jsx-props-no-spreading */
import { Boundary } from '@/components/common';
import { AppliedFilters, ProductList } from '@/components/product';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { selectFilter } from '@/selectors/selector';
import { ProductsNavbar } from '../components';
import ProductsTable from '../components/ProductsTable';
import ImportModal from './ImportModal';

const Products = () => {
  useDocumentTitle('Product List | Salinaka Admin');
  useScrollTop();

  const [isImportModalOpen, setImportModalOpen] = React.useState(false);

  const store = useSelector((state) => ({
    filteredProducts: selectFilter(state.products.items, state.filter),
    requestStatus: state.app.requestStatus,
    isLoading: state.app.loading,
    products: state.products
  }));

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  return (
    <Boundary>
      <ProductsNavbar
        productsCount={store.products.items.length}
        totalProductsCount={store.products.total}
        onImportClick={openImportModal}
      />
      <div className="product-admin-items">
        <ProductList {...store}>
          <AppliedFilters filter={store.filter} />
          <ProductsTable filteredProducts={store.filteredProducts} />
        </ProductList>
      </div>
      <ImportModal isOpen={isImportModalOpen} onRequestClose={closeImportModal} />
    </Boundary>
  );
};

export default withRouter(Products);
