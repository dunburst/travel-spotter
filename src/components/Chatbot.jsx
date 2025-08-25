import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import './Chatbot.css'; // File CSS sẽ tạo ở bước tiếp theo

const ChatIcon = () => (
    // ... (SVG code không thay đổi)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.247a.75.75 0 01-.696-.696v-3.722c0-.969.616-1.813 1.5-2.097L20.25 8.511zM6.75 9.75l-2.25-2.25a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06-1.06zM9 9.75a.75.75 0 00-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM12.75 9.75l-2.25-2.25a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06-1.06zM15 9.75a.75.75 0 00-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM15 13.5a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H15.75a.75.75 0 01-.75-.75z" />
    </svg>
);

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Tôi là trợ lý ảo của TravelSuggest. Tôi có thể giúp gì cho bạn?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef(null);

    // Danh sách câu hỏi gợi ý
    const suggestedQuestions = [
        "Lợi ích khi hợp tác là gì?",
        "Bảng giá dịch vụ như thế nào?",
        "Làm thế nào để đăng ký?",
    ];

    useEffect(() => {
        // Tự động cuộn xuống tin nhắn cuối cùng
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);
    
    // Tách logic gửi tin nhắn ra một hàm riêng để tái sử dụng
    const processAndSendMessage = async (messageText) => {
        const userMessage = { text: messageText, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const botResponse = await sendMessageToGemini(messageText);
            const botMessage = { text: botResponse, sender: "bot" };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại.", sender: "bot" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        processAndSendMessage(inputValue);
        setInputValue('');
    };

    // Hàm xử lý khi nhấn vào câu hỏi gợi ý
    const handleSuggestedQuestionClick = (question) => {
        if (isLoading) return; // Không cho gửi khi đang xử lý
        processAndSendMessage(question);
    };

    return (
        <div className="chatbot-container">
            <button className="chatbot-toggler" onClick={toggleChat}>
                <ChatIcon />
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h2>Trợ lý ảo TravelSuggest</h2>
                        <button onClick={toggleChat}>&times;</button>
                    </div>
                    <div className="chatbot-body" ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message bot loading">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                    </div>
                    
                    {/* Hiển thị câu hỏi gợi ý khi bắt đầu chat */}
                    {messages.length === 1 && (
                        <div className="suggested-questions">
                            {suggestedQuestions.map((q, index) => (
                                <button key={index} onClick={() => handleSuggestedQuestionClick(q)} disabled={isLoading}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>Gửi</button>
                    </form>
                </div>
            )}
        </div>
    );
}