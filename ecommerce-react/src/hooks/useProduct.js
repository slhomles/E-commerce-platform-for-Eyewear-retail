import { useDidMount } from '@/hooks';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '@/services/api';

const useProduct = (id) => {
  // get and check if product exists in store
  const storeProductList = useSelector((state) => state.products.items);
  const storeProduct = storeProductList.find((item) => item.id === id);

  const [product, setProduct] = useState(storeProduct);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didMount = useDidMount(true);

  useEffect(() => {
    (async () => {
      try {
        if (!product || product.id !== id) {
          setLoading(true);
          const data = await api.getSingleProduct(id, storeProductList);

          if (data) {
            if (didMount) {
              setProduct(data);
              setLoading(false);
            }
          } else {
            setError('Product not found.');
          }
        }
      } catch (err) {
        if (didMount) {
          setLoading(false);
          setError(err?.message || 'Something went wrong.');
        }
      }
    })();
  }, [id]);

  return { product, isLoading, error };
};

export default useProduct;
