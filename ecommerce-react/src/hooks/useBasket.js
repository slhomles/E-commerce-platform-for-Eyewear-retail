import { displayActionMessage } from '@/helpers/utils';
import { useDispatch, useSelector } from 'react-redux';
import { addToBasket as dispatchAddToBasket, removeFromBasket } from '@/redux/actions/basketActions';
import { serverAddToCart, serverRemoveCartItem } from '@/redux/actions/cartActions';

const useBasket = () => {
  const { basket, cart } = useSelector((state) => ({
    basket: state.basket,
    cart: state.cart
  }));
  const dispatch = useDispatch();

  const isItemOnBasket = (id) => !!basket.find((item) => item.id === id);

  const addToBasket = (product) => {
    if (isItemOnBasket(product.id)) {
      dispatch(removeFromBasket(product.id));

      // Sync remove to server cart - find itemId by variantId
      const variantId = product.selectedVariantId || product.variants?.[0]?.id;
      if (variantId && cart?.items?.length) {
        const serverItem = cart.items.find((item) => item.variantId === variantId);
        if (serverItem) {
          dispatch(serverRemoveCartItem(serverItem.itemId));
        }
      }

      displayActionMessage('Item removed from basket', 'info');
    } else {
      dispatch(dispatchAddToBasket(product));

      // Sync add to server cart
      const variantId = product.selectedVariantId || product.variants?.[0]?.id;
      if (variantId) {
        dispatch(serverAddToCart(variantId, product.quantity || 1));
      }

      displayActionMessage('Item added to basket', 'success');
    }
  };

  return { basket, isItemOnBasket, addToBasket };
};

export default useBasket;
