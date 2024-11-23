import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import styles from './style.component/ChatBot.module.css';
import axios from 'axios';
import api from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: 'Xin chào! Tôi là OBEY Assistant. Tôi có thể giúp gì cho bạn?',
      isBot: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (message, chatHistory) => {
    try {
      const response = await api.post('/chat', {
        message,
        chatHistory: chatHistory.filter(msg => 
          msg.text !== 'Không có token, quyền truy cập bị từ chối'
        )
      });

      return response.data.response;

    } catch (error) {
      console.error('Error in getAIResponse:', error);
      return getFallbackResponse(message);
    }
  };

  const getFallbackResponse = (message) => {
    if (message.toLowerCase().includes('size')) {
      return `Dưới đây là bảng size tham khảo của OBEY:
      - Size S: 40-60kg
      - Size M: 55-65kg
      - Size L: 63-75kg
      - Size XL: 70-85kg
      
      Bạn có thể cho tôi biết chiều cao và cân nặng để được tư vấn cụ thể hơn.`;
    }
    return 'Xin lỗi, hiện tại hệ thống đang bận. Bạn có thể liên hệ hotline 1900xxxx để được hỗ trợ.';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Thêm tin nhắn người dùng
    const userMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Lấy phản hồi từ AI
      const aiResponse = await getAIResponse(inputMessage, messages);
      if (!aiResponse) {
        const fallbackResponse = getFallbackResponse(inputMessage);
        setMessages(prev => [...prev, { 
          text: fallbackResponse,
          isBot: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: aiResponse,
          isBot: true
        }]);
      }
    } catch (error) {
      const fallbackResponse = getFallbackResponse(inputMessage);
      setMessages(prev => [...prev, { 
        text: fallbackResponse,
        isBot: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatbot}>
      {isOpen ? (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <FaUser className={styles.botAvatar} />
              <div>
                <h3>OBEY Assistant</h3>
                <span className={styles.status}>
                  {isTyping ? 'Đang trả lời...' : 'Trực tuyến'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.messageWrapper} ${msg.isBot ? styles.bot : styles.user}`}
              >
                <div className={styles.message}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.bot}`}>
                <div className={`${styles.message} ${styles.typing}`}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInput}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      ) : (
        <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
          <FaComments />
          <span className={styles.chatLabel}>Hỗ trợ trực tuyến</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot; 