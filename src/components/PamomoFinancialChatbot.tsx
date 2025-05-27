import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface PamomoFinancialChatbotProps {
  onClose?: () => void;
}

/**
 * PamomoFinancialChatbot - Customer support chatbot using Chatbase
 * Replaced the custom implementation with a Chatbase embedded iframe
 */
const PamomoFinancialChatbot: React.FC<PamomoFinancialChatbotProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(!!onClose); // Open automatically if onClose is provided
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Reset unread count when chatbot is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    } else {
      // Simulate new messages when chatbot is closed
      const interval = setInterval(() => {
        if (!isOpen && Math.random() > 0.85) { // 15% chance of new message
          setUnreadCount(prev => prev + 1);
        }
      }, 45000); // Check every 45 seconds
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const toggleChatbot = () => {
    if (onClose && !isOpen) {
      // If there's an onClose function, call it instead of closing internally
      onClose();
    } else {
      setIsOpen(!isOpen);
    }
    setIsMinimized(false);
    setUnreadCount(0); // Reset notification counter when opened
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  return (
    <div className="fixed bottom-6 right-6 z-50">      {!isOpen && !onClose && (
        <button
          onClick={toggleChatbot}
          className="bg-[#8928A4] text-white px-3 sm:px-5 py-2 sm:py-3 rounded-full shadow-lg hover:bg-[#722389] transition-all duration-300 flex items-center relative group"
          aria-label="Open customer support"
        >
          <MessageCircle size={18} className="mr-1 sm:mr-2" />
          <span className="font-medium text-sm sm:text-base">Need help?</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="absolute inset-0 rounded-full bg-[#8928A4] opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-ping-slow"></span>
        </button>
      )}
      
      {isOpen && (        <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-[350px] sm:max-w-[380px] flex flex-col border border-gray-200 h-[500px] max-h-[80vh]">
          {/* Chatbot header */}
          <div className="bg-[#8928A4] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-sm sm:text-base font-medium">Momo Customer Support</h3>
            </div>
            <div className="flex items-center">
              <button 
                onClick={toggleMinimize} 
                className="text-white/80 hover:text-white mr-2"
                aria-label={isMinimized ? "Expand chatbot" : "Minimize chatbot"}
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button 
                onClick={onClose || toggleChatbot}
                className="text-white/80 hover:text-white"
                aria-label="Close chatbot"
              >
                <X size={16} />
              </button>
            </div>
          </div>
            {/* Chatbot content */}
          {!isMinimized && (            <div className="flex flex-col h-full">
              {/* Loading indicator overlay */}              <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10 animate-fade-out">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-3 border-[#8928A4] border-t-transparent animate-spin"></div>
                    <p className="mt-2 text-xs sm:text-sm text-[#8928A4] font-medium animate-pulse">Loading support chat...</p>
                  </div>
                </div>
                
                <iframe
                  src="https://www.chatbase.co/chatbot-iframe/En8X6Ub3qsqKpqA6dWkqj"
                  width="100%"
                  style={{ height: "100%", minHeight: "380px" }}
                  frameBorder="0"
                  title="Momo Customer Support"
                  className="animate-fade-in"
                ></iframe>
              </div>
              
              {/* Contact Information with improved styling */}              <div className="p-3 bg-gradient-to-r from-purple-50 to-white border-t border-purple-100 text-xs shadow-inner">
                <div className="flex flex-col space-y-1">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Contact Us Directly</h4>
                  <div className="flex items-center text-gray-600 hover:text-[#8928A4] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#8928A4]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs">Email: <a href="mailto:securemomo.africa@gmail.com" className="text-[#8928A4] font-medium hover:underline truncate">securemomo.africa@gmail.com</a></span>
                  </div>
                  <div className="flex items-center text-gray-600 hover:text-[#8928A4] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#8928A4]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs">Phone: <a href="tel:+265994921108" className="text-[#8928A4] font-medium hover:underline">+265 994 921 108</a></span>
                  </div>
                  <div className="flex items-center text-gray-600 hover:text-[#8928A4] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#8928A4] opacity-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs">Phone: <a href="tel:+265885259888" className="text-[#8928A4] font-medium hover:underline">+265 885 259 888</a></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PamomoFinancialChatbot;