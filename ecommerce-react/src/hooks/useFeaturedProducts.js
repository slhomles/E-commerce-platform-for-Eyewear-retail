import { useDidMount } from '@/hooks';
import { useEffect, useState } from 'react';
import api from '@/services/api';

const useFeaturedProducts = (itemsCount) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didMount = useDidMount(true);

  const fetchFeaturedProducts = async (count) => {
    try {
      setLoading(true);
      setError('');

      const products = await api.getFeaturedProducts(count || itemsCount);

      if (!products || products.length === 0) {
        if (didMount) {
          setError('No featured products found.');
          setLoading(false);
        }
      } else {
        if (didMount) {
          setFeaturedProducts(products);
          setLoading(false);
        }
      }
    } catch (e) {
      if (didMount) {
        setError('Failed to fetch featured products');
        setLoading(false);
      }
    }
  };

  // Re-fetch mỗi khi itemsCount thay đổi (bao gồm lần đầu mount)
  useEffect(() => {
    if (didMount && itemsCount) {
      setFeaturedProducts([]); // reset để re-fetch
      fetchFeaturedProducts(itemsCount);
    }
  }, [itemsCount]);

  return {
    featuredProducts, fetchFeaturedProducts, isLoading, error
  };
};

export default useFeaturedProducts;
