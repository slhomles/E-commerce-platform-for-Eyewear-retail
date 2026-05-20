/* eslint-disable react/jsx-props-no-spreading */
import { AppliedFilters, ProductGrid } from '@/components/product';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { selectFilter } from '@/selectors/selector';
import { setLoading, setRequestStatus } from '@/redux/actions/miscActions';
import { GET_PRODUCTS_SUCCESS } from '@/constants/constants';
import { MessageDisplay } from '@/components/common';
import api from '@/services/api';

const Shop = () => {
  useDocumentTitle('Shop | Salinaka');
  useScrollTop();

  const dispatch = useDispatch();
  const [shopPageSize, setShopPageSize] = useState(12);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [priceSettings, setPriceSettings] = useState({
    showOriginalPrice: true,
    showSalePrice: true,
    showDiscountBadge: true,
  });

  const store = useSelector((state) => ({
    filteredProducts: selectFilter(state.products.items, state.filter),
    products: state.products,
    requestStatus: state.app.requestStatus,
    isLoading: state.app.loading
  }), shallowEqual);

  // Helper: dispatch GET_PRODUCTS_SUCCESS directly
  const dispatchProducts = useCallback((products, lastKey, total, append = false) => {
    dispatch({
      type: GET_PRODUCTS_SUCCESS,
      payload: {
        products: append ? products : products, // reducer appends
        lastKey,
        total
      }
    });
  }, [dispatch]);

  // Reset store and fetch with the new page size
  const fetchInitial = useCallback(async (pageSize) => {
    dispatch(setLoading(true));
    dispatch(setRequestStatus(null));
    // Reset products store to empty
    dispatch({ type: 'RESET_PRODUCTS' });
    try {
      const result = await api.getProducts(null, { page: 0, size: pageSize });
      if (!result.products || result.products.length === 0) {
        dispatch(setRequestStatus('No items found.'));
      } else {
        dispatchProducts(result.products, result.lastKey, result.total);
        dispatch(setRequestStatus(''));
      }
    } catch (e) {
      dispatch(setRequestStatus(e?.message || 'Failed to fetch products'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, dispatchProducts]);

  // Step 1: read settings
  useEffect(() => {
    api.getPublicSettings()
      .then((settingsList) => {
        const get = (key) => {
          const s = settingsList.find((x) => x.key === key);
          return s ? s.value !== 'false' : true;
        };
        const s = settingsList.find((x) => x.key === 'shop_page_size');
        if (s) {
          const val = parseInt(s.value, 10);
          if (!isNaN(val)) setShopPageSize(val);
        }
        setPriceSettings({
          showOriginalPrice: get('show_original_price'),
          showSalePrice: get('show_sale_price'),
          showDiscountBadge: get('show_discount_badge'),
        });
      })
      .catch(() => {})
      .finally(() => setSettingsLoaded(true));
  }, []);

  // Step 2: fetch products after settings are loaded
  useEffect(() => {
    if (settingsLoaded) {
      fetchInitial(shopPageSize);
    }
  }, [settingsLoaded, shopPageSize]);

  // Load more
  const handleLoadMore = async () => {
    if (isFetching || store.products.lastRefKey == null) return;
    setFetching(true);
    try {
      const result = await api.getProducts(null, {
        page: store.products.lastRefKey,
        size: shopPageSize
      });
      if (result.products.length > 0) {
        dispatchProducts(result.products, result.lastKey, result.total);
      }
    } catch (e) {
      console.error('Load more failed:', e);
    } finally {
      setFetching(false);
    }
  };

  if (store.isLoading) {
    return (
      <main className="content">
        <section className="product-list-wrapper">
          <div className="loader" style={{ minHeight: '60vh' }}>
            <h6>Loading products...</h6>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="content">
      <section className="product-list-wrapper">
        <AppliedFilters filteredProductsCount={store.filteredProducts.length} />
        {store.filteredProducts.length === 0 ? (
          <MessageDisplay
            message={store.requestStatus || 'No products found.'}
            action={() => fetchInitial(shopPageSize)}
            buttonLabel="Try Again"
          />
        ) : (
          <>
            <ProductGrid products={store.filteredProducts} priceSettings={priceSettings} />
            {store.products.items.length < store.products.total && (
              <div className="d-flex-center padding-l">
                <button
                  className="button button-small"
                  disabled={isFetching}
                  onClick={handleLoadMore}
                  type="button"
                >
                  {isFetching ? 'Loading...' : 'Show More Items'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Shop;
