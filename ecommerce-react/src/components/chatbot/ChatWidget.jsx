import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import './chatbot.css';
import api from '../../services/api';

const INITIAL_MESSAGE = {
    role: 'assistant',
    text: 'Hello! I can help you find suitable eyewear, check your orders, or answer product questions. How can I help?',
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
                    text: 'Sorry, something went wrong. Please try again later.',
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
                title="Chat with AI assistant"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </>
    );
};

export default ChatWidget;
