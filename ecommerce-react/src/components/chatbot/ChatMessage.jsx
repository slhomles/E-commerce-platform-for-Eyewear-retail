import React from 'react';
import ProductCardInChat from './ProductCardInChat';

const formatPrice = (amount) => {
    if (amount == null) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const OrderStatusCard = ({ orderStatus }) => (
    <div className="chat-order-status">
        <span className="chat-order-code">Order #{orderStatus.code}</span>
        <span className={`chat-order-status-badge status-${orderStatus.status}`}>
            {orderStatus.status}
        </span>
        {orderStatus.finalAmount != null && (
            <span className="chat-order-amount">{formatPrice(orderStatus.finalAmount)}</span>
        )}
    </div>
);

const ChatMessage = ({ message }) => {
    return (
        <div className={`chat-msg chat-msg--${message.role}`}>
            <div className="chat-bubble">{message.text}</div>
            {message.productCards && message.productCards.length > 0 && (
                <div className="chat-product-cards">
                    {message.productCards.map((p) => (
                        <ProductCardInChat key={p.id} product={p} />
                    ))}
                </div>
            )}
            {message.orderStatus && (
                <OrderStatusCard orderStatus={message.orderStatus} />
            )}
            {message.orderList && message.orderList.length > 0 && (
                <div className="chat-order-list">
                    {message.orderList.map((o) => (
                        <OrderStatusCard key={o.orderId} orderStatus={o} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
