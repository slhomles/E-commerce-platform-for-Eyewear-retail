import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addQtyItem, minusQtyItem, setQtyItem } from '@/redux/actions/basketActions';

const BasketItemControl = ({ product }) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState(String(product.quantity || 1));

  useEffect(() => {
    setInputValue(String(product.quantity || 1));
  }, [product.quantity]);

  const maxQty = product.maxQuantity || Infinity;

  const onAddQty = () => {
    if (product.quantity < maxQty) {
      dispatch(addQtyItem(product.id));
    }
  };

  const onMinusQty = () => {
    if (product.quantity > 1) {
      dispatch(minusQtyItem(product.id));
    }
  };

  const onInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue('');
      return;
    }
    if (/^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const commitQty = () => {
    let qty = parseInt(inputValue, 10);
    if (!qty || qty < 1) {
      qty = 1;
    }
    if (maxQty !== Infinity && qty > maxQty) {
      qty = maxQty;
    }
    setInputValue(String(qty));
    if (qty !== product.quantity) {
      dispatch(setQtyItem(product.id, qty));
    }
  };

  const onInputBlur = () => {
    commitQty();
  };

  const onInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitQty();
      e.target.blur();
    }
  };

  return (
    <div className="basket-item-control">
      <button
        className="button button-border button-border-gray button-small basket-control basket-control-add"
        disabled={product.quantity >= maxQty}
        onClick={onAddQty}
        type="button"
      >
        <PlusOutlined style={{ fontSize: '9px' }} />
      </button>
      <input
        className="basket-qty-input"
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
      />
      <button
        className="button button-border button-border-gray button-small basket-control basket-control-minus"
        disabled={product.quantity <= 1}
        onClick={onMinusQty}
        type="button"
      >
        <MinusOutlined style={{ fontSize: '9px' }} />
      </button>
    </div>
  );
};

BasketItemControl.propTypes = {
  product: PropType.shape({
    id: PropType.string,
    name: PropType.string,
    brand: PropType.string,
    price: PropType.number,
    quantity: PropType.number,
    maxQuantity: PropType.number,
    description: PropType.string,
    keywords: PropType.arrayOf(PropType.string),
    selectedSize: PropType.string,
    selectedColor: PropType.string,
    imageCollection: PropType.arrayOf(PropType.string),
    sizes: PropType.arrayOf(PropType.number),
    image: PropType.string,
    imageUrl: PropType.string,
    isFeatured: PropType.bool,
    isRecommended: PropType.bool,
    availableColors: PropType.arrayOf(PropType.string)
  }).isRequired
};

export default BasketItemControl;
