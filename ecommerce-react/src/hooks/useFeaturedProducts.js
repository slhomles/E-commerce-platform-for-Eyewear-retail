import { useDidMount } from '@/hooks';
import { useEffect, useState } from 'react';
import api from '@/services/api';

const useFeaturedProducts = (itemsCount) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didMount = useDidMount(true);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const products = await api.getFeaturedProducts(itemsCount);

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

  useEffect(() => {
    if (featuredProducts.length === 0 && didMount) {
      fetchFeaturedProducts();
    }
  }, []);

  return {
    featuredProducts, fetchFeaturedProducts, isLoading, error
  };
};

export default useFeaturedProducts;
