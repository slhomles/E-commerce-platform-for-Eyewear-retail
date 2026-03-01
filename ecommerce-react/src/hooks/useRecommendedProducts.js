import { useDidMount } from '@/hooks';
import { useEffect, useState } from 'react';
import api from '@/services/api';

const useRecommendedProducts = (itemsCount) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didMount = useDidMount(true);

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const products = await api.getRecommendedProducts(itemsCount);

      if (!products || products.length === 0) {
        if (didMount) {
          setError('No recommended products found.');
          setLoading(false);
        }
      } else {
        if (didMount) {
          setRecommendedProducts(products);
          setLoading(false);
        }
      }
    } catch (e) {
      if (didMount) {
        setError('Failed to fetch recommended products');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (recommendedProducts.length === 0 && didMount) {
      fetchRecommendedProducts();
    }
  }, []);


  return {
    recommendedProducts, fetchRecommendedProducts, isLoading, error
  };
};

export default useRecommendedProducts;
