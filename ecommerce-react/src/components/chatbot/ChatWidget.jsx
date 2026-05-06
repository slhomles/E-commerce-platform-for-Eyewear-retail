import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import './chatbot.css';
import api from '../../services/api';

const INITIAL_MESSAGE = {
    role: 'assistant',
    text: 'Xin chào! Tôi có thể giúp bạn tìm kính mắt phù hợp, kiểm tra đơn hàng, hoặc trả lời mọi câu hỏi về sản phẩm. Bạn cần hỗ trợ gì?',
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text || isLoading) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInputText('');
        setIsLoading(true);

        try {
            const data = await api.sendMessage(text, sessionId);
            setSessionId(data.sessionId);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: data.reply,
                    productCards: data.productCards || [],
                    orderStatus: data.orderStatus || null,
                    orderList: data.orderList || null,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <ChatPanel
                    messages={messages}
                    inputText={inputText}
                    isLoading={isLoading}
                    onInput={setInputText}
                    onSend={sendMessage}
                    onClose={() => setIsOpen(false)}
                />
            )}
            <button
                className="chat-fab"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                title="Chat với trợ lý AI"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </>
    );
};

export default ChatWidget;
