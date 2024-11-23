import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import styles from './style.component/ChatBot.module.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: 'Xin chào! Tôi là OBEY Assistant. Tôi có thể giúp gì cho bạn?',
      isBot: true,
      options: [
        'Tìm sản phẩm',
        'Hướng dẫn chọn size',
        'Chính sách đổi trả',
        'Thông tin vận chuyển',
        'Khuyến mãi hiện có'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Thêm tin nhắn người dùng
    const userMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Lấy phản hồi từ bot
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, { 
        text: botResponse.text, 
        isBot: true,
        options: botResponse.options 
      }]);
    }, 500);
  };

  const handleOptionClick = (option) => {
    // Thêm lựa chọn của người dùng vào chat
    setMessages(prev => [...prev, { text: option, isBot: false }]);
    
    // Lấy phản hồi từ bot
    setTimeout(() => {
      const botResponse = getBotResponse(option);
      setMessages(prev => [...prev, { 
        text: botResponse.text, 
        isBot: true,
        options: botResponse.options 
      }]);
    }, 500);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Xử lý câu hỏi về size
    if (lowerMessage.includes('size') || lowerMessage.includes('kích thước')) {
      return {
        text: 'Bạn có thể tham khảo bảng size của chúng tôi:\n- S: 40-60kg\n- M: 55-65kg\n- L: 63-75kg\n- XL: 70-85kg\nBạn cần tư vấn cụ thể hơn về size không?',
        options: ['Tư vấn chọn size', 'Xem bảng size chi tiết']
      };
    }

    // Xử lý câu hỏi về vận chuyển
    if (lowerMessage.includes('ship') || lowerMessage.includes('giao hàng') || lowerMessage.includes('vận chuyển')) {
      return {
        text: 'OBEY hỗ trợ giao hàng toàn quốc:\n- Nội thành: 1-2 ngày\n- Ngoại thành: 2-3 ngày\n- Tỉnh khác: 3-5 ngày\nPhí ship sẽ được tính dựa theo địa chỉ cụ thể.',
        options: ['Tính phí ship', 'Chính sách giao hàng']
      };
    }

    // Xử lý câu hỏi về thanh toán
    if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment')) {
      return {
        text: 'OBEY hỗ trợ các hình thức thanh toán:\n- COD (Thanh toán khi nhận hàng)\n- Chuyển khoản ngân hàng\n- Ví điện tử (Momo, ZaloPay)\n- Thẻ tín dụng/ghi nợ',
        options: ['Thông tin chuyển khoản', 'Hướng dẫn thanh toán']
      };
    }

    // Xử lý câu hỏi về khuyến mãi
    if (lowerMessage.includes('sale') || lowerMessage.includes('khuyến mãi') || lowerMessage.includes('giảm giá')) {
      return {
        text: 'Hiện tại OBEY đang có các chương trình:\n- Giảm 10% cho đơn hàng từ 1 triệu\n- Freeship cho đơn từ 500k\n- Tặng voucher 100k cho khách hàng mới',
        options: ['Xem thêm khuyến mãi', 'Nhận mã giảm giá']
      };
    }

    // Xử lý câu hỏi về đổi trả
    if (lowerMessage.includes('đổi') || lowerMessage.includes('trả') || lowerMessage.includes('hoàn tiền')) {
      return {
        text: 'OBEY hỗ trợ đổi trả trong vòng 7 ngày với điều kiện:\n- Sản phẩm còn nguyên tem mác\n- Không có dấu hiệu đã qua sử dụng\n- Có hóa đơn mua hàng',
        options: ['Chính sách đổi trả', 'Hướng dẫn đổi trả']
      };
    }

    // Câu trả lời mặc định
    return {
      text: 'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể chọn một trong những chủ đề sau:',
      options: [
        'Tìm sản phẩm',
        'Hướng dẫn chọn size',
        'Chính sách đổi trả',
        'Thông tin vận chuyển',
        'Khuyến mãi hiện có'
      ]
    };
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
                <span className={styles.status}>Trực tuyến</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.messageWrapper} ${msg.isBot ? styles.bot : styles.user}`}>
                <div className={styles.message}>
                  {msg.text}
                  {msg.isBot && msg.options && (
                    <div className={styles.options}>
                      {msg.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className={styles.optionButton}
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInput}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button type="submit">
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