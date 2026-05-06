import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

const TypingIndicator = () => (
    <div className="chat-msg chat-msg--assistant">
        <div className="chat-typing">
            <span /><span /><span />
        </div>
    </div>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const ChatPanel = ({ messages, inputText, isLoading, onInput, onSend, onClose }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="chat-panel">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-header-avatar">👓</div>
                    <div>
                        <div className="chat-header-title">Glasses Store</div>
                        <div className="chat-header-subtitle">Trợ lý AI · Luôn sẵn sàng hỗ trợ</div>
                    </div>
                </div>
                <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">✕</button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <textarea
                    className="chat-input"
                    value={inputText}
                    onChange={(e) => onInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi..."
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className="chat-send-btn"
                    onClick={onSend}
                    disabled={isLoading || !inputText.trim()}
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
