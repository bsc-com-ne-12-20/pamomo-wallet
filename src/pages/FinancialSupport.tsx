import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, ChevronUp, BookOpen, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FinancialSupportPageProps {
  username: string;
  onLogout: () => void;
}

// Financial knowledge base
const financialKnowledge = {
  "budget": {
    topic: "Budgeting",
    content: "A budget is a plan for your money. It helps you track income and expenses to achieve financial goals.\n\nTips for budgeting:\n• Track all expenses for 30 days\n• Allocate 50% for needs, 30% for wants, 20% for savings\n• Review your budget monthly\n• Use the Pamomo Wallet app to categorize expenses"
  },
  "savings": {
    topic: "Saving Money",
    content: "Saving money creates financial security and helps achieve long-term goals.\n\nSaving strategies:\n• Start with a small emergency fund (1 month of expenses)\n• Save at least 10% of your income\n• Set up automatic transfers to a savings account\n• Use specific savings goals (like education or housing)"
  },
  "emergency_fund": {
    topic: "Emergency Fund",
    content: "An emergency fund is money set aside for unexpected expenses like medical bills or car repairs.\n\nRecommended emergency fund:\n• Start with MWK 50,000\n• Build up to 3-6 months of essential expenses\n• Keep in a separate account from daily spending\n• Replenish after using"
  },
  "digital_id": {
    topic: "Digital ID",
    content: "A digital ID is an electronic version of your national identification that simplifies identity verification.\n\nBenefits of Digital ID:\n• No need to carry physical ID card\n• Quick and seamless identity verification\n• Authenticate using OTP or biometrics\n• Links to your existing National ID number\n\nWith Pamomo Wallet, you can register your Digital ID once and use it for all future identity verifications."
  },
  "national_id_link": {
    topic: "Linking National ID to Digital ID",
    content: "Your Digital ID is directly linked to your National ID number issued by the government.\n\nHow it works:\n• Register with your National ID number\n• Verify using biometrics or OTP sent to your registered phone\n• Once verified, your Digital ID is created\n• Use your Digital ID for identity verification instead of physical ID\n\nThis makes identity verification faster, more secure, and prevents identity fraud."
  },
  "compound_interest": {
    topic: "Compound Interest",
    content: "Compound interest is interest calculated on both initial principal and accumulated interest.\n\nExample:\nIf you deposit MWK 10,000 at 5% annual interest:\n• After 1 year: MWK 10,500\n• After 2 years: MWK 11,025 (interest on MWK 10,500)\n• After 10 years: MWK 16,289\n\nThis is why starting to save early is powerful!"
  },
  "mobile_money": {
    topic: "Mobile Money",
    content: "Mobile money is a service that allows you to store and transfer money using your mobile phone.\n\nSafety tips:\n• Never share PIN codes with anyone\n• Verify recipient numbers before sending\n• Keep transaction receipts\n• Report suspicious activities immediately\n• Use biometric authentication when available"
  },
  "loans": {
    topic: "Understanding Loans",
    content: "A loan is money borrowed that must be repaid with interest.\n\nBefore taking a loan, consider:\n• Interest rate and total cost\n• Repayment period and installments\n• Your ability to repay consistently\n• Purpose of the loan (productive vs. consumption)\n• Penalties for late payments"
  },
  "digital_payments": {
    topic: "Digital Payments",
    content: "Digital payments include mobile money, bank transfers, and wallet transactions.\n\nAdvantages:\n• Convenience and speed\n• Transaction records for budgeting\n• Reduced risk of theft compared to cash\n• Accessible anywhere with network coverage\n• Often lower fees for person-to-person transfers"
  },
  "biometric_authentication": {
    topic: "Biometric Authentication",
    content: "Biometric authentication uses unique physical characteristics like fingerprints or facial features to verify identity.\n\nBenefits with Digital ID:\n• More secure than passwords or PINs\n• Cannot be forgotten or lost\n• Difficult to forge or steal\n• Quick and convenient verification\n• Reduces fraud in financial transactions"
  },
  "auto_payments": {
    topic: "Auto Payments",
    content: "Auto payments are recurring transactions that are processed automatically on a schedule you set.\n\nBenefits of auto payments:\n• Never miss bill payments or due dates\n• Save time by automating regular transfers\n• Plan your finances better with predictable payment dates\n• Reduce late fees and penalties\n\nWith Pamomo Wallet Premium, you can set up auto payments for regular bills, subscriptions, and transfers to friends and family."
  },
  "recurring_payments": {
    topic: "Recurring Payments",
    content: "Recurring payments allow you to schedule regular transactions that happen automatically.\n\nHow to use recurring payments:\n• Select a recipient and amount\n• Choose frequency (daily, weekly, monthly)\n• Set a start date and optional end date\n• Confirm your setup\n\nThis feature is ideal for rent payments, subscriptions, regular savings, or supporting family members with consistent income."
  }
};

// Common financial questions and their answers
const commonQuestions: Record<string, string> = {
  "what is a budget": "budget",
  "how do i budget": "budget",
  "budgeting tips": "budget",
  "how to save money": "savings",
  "saving tips": "savings",
  "what is an emergency fund": "emergency_fund",
  "emergency savings": "emergency_fund",
  "what is a digital id": "digital_id",
  "explain digital id": "digital_id",
  "how does digital id work": "digital_id",
  "digital id benefits": "digital_id",
  "national id": "national_id_link",
  "link id": "national_id_link",
  "how to link national id": "national_id_link",
  "what is compound interest": "compound_interest",
  "interest explanation": "compound_interest",
  "mobile money safety": "mobile_money",
  "mobile money tips": "mobile_money",
  "should i take a loan": "loans",
  "loan considerations": "loans",
  "digital payments": "digital_payments",
  "mobile payments": "digital_payments",
  "biometric authentication": "biometric_authentication",
  "fingerprint verification": "biometric_authentication",
  "what is your name": "chatbot_name",
  "who are you": "chatbot_name",
  "your name": "chatbot_name",
  "tell me about yourself": "chatbot_intro",
  "how can you help": "chatbot_intro",
  "what can you do": "chatbot_intro",
  "what are auto payments": "auto_payments",
  "auto payment": "auto_payments",
  "automatic payments": "auto_payments",
  "recurring payments": "recurring_payments",
  "scheduled payments": "auto_payments",
  "payment schedule": "auto_payments",
  "regular payments": "auto_payments",
  "bill payments": "auto_payments"
};

const suggestedQuestions = [
  "What is a Digital ID?",
  "How to link National ID?",
  "Budgeting tips",
  "How to save money",
  "What is compound interest?",
  "Mobile money safety"
];

const FinancialSupportPage: React.FC<FinancialSupportPageProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello! I'm Pamomo, your financial education assistant. I can help you learn about budgeting, saving, digital IDs, and more. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef<null | HTMLDivElement>(null);
  
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const findBestMatch = (query: string): string => {
    query = query.toLowerCase().trim();
    
    // Exact phrase matching first
    if (commonQuestions[query]) {
      return commonQuestions[query];
    }
    
    // Direct match in common questions (partial phrases)
    for (const [question, answer] of Object.entries(commonQuestions)) {
      if (query.includes(question)) {
        return answer;
      }
    }
    
    // Keyword matching in knowledge base topics
    for (const [key, info] of Object.entries(financialKnowledge)) {
      if (query.includes(key)) {
        return key;
      }
    }
    
    // Keyword matching in common questions with scoring
    let bestMatchScore = 0;
    let bestMatch = "";
    
    for (const question in commonQuestions) {
      const words = question.split(' ');
      let score = 0;
      
      for (const word of words) {
        // Only consider meaningful words (length > 2)
        if (word.length > 2 && query.includes(word)) {
          // Give higher score to more specific terms
          score += word.length;
        }
      }
      
      // Check if query words are in the question
      const queryWords = query.split(' ');
      for (const word of queryWords) {
        if (word.length > 2 && question.includes(word)) {
          score += word.length;
        }
      }
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = commonQuestions[question];
      }
    }
    
    if (bestMatchScore > 5) { // Set a minimum threshold for match quality
      return bestMatch;
    }
    
    // Default responses for specific topics
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return "greeting";
    }
    
    if (query.includes('thank')) {
      return "thanks";
    }
    
    // No match found
    return "unknown";
  };

  const getResponse = (query: string): string => {
    const match = findBestMatch(query);
    
    if (match === "chatbot_name") {
      return "My name is Pamomo! I'm your financial education assistant here at Pamomo Wallet. How can I help you today?";
    }
    
    if (match === "chatbot_intro") {
      return "I'm Pamomo, your financial education assistant. I can help you learn about:\n\n• Digital ID and biometric authentication\n• Budgeting and saving strategies\n• Mobile money and digital payments\n• Financial terms and concepts\n\nJust ask me anything about these topics!";
    }
    
    if (match === "greeting") {
      return "Hello! How can I help you with financial education today? You can ask about Digital IDs, budgeting, saving, or any financial terms.";
    }
    
    if (match === "thanks") {
      return "You're welcome! If you have any more questions about financial topics, feel free to ask anytime.";
    }
    
    if (match === "unknown") {
      return `I'm not sure about that. Here are some topics I can help with: Digital IDs, budgeting, saving money, compound interest, loans, and mobile money. Would you like to learn about any of these?`;
    }
    
    return financialKnowledge[match].content;
  };

  const handleSendMessage = (e?: React.FormEvent, suggestedQuestion?: string) => {
    e?.preventDefault();
    
    const userMessage = suggestedQuestion || input;
    if (!userMessage.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { 
      text: userMessage, 
      isUser: true,
      timestamp: new Date()
    }]);
    setInput('');
    
    // Add assistant response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: getResponse(userMessage), 
        isUser: false,
        timestamp: new Date()
      }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8 pt-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen size={24} className="text-[#8928A4] mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Financial Support Assistant</h2>
            </div>
            <button
              onClick={toggleMinimize}
              className="text-gray-500 hover:text-[#8928A4]"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-gray-50">
            {!isMinimized && (
              <>
                <div className="h-[400px] overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser 
                              ? 'bg-[#8928A4] text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.isUser ? 'text-purple-200' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messageEndRef}></div>
                  </div>
                </div>

                {/* Suggested questions */}
                {messages.length < 3 && (
                  <div className="px-4 pb-3 bg-white border-t">
                    <p className="text-xs text-gray-500 mt-3 mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(undefined, question)}
                          className="bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your financial question..."
                    className="flex-1 bg-gray-100 border-none rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8928A4]"
                    aria-label="Type your financial question"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-[#8928A4] text-white px-6 rounded-r-lg hover:bg-[#722389] transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Financial Education Resources */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Education Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-[#8928A4] mb-2">Budgeting Basics</h4>
                <p className="text-sm text-gray-600">Learn how to create and stick to a budget that works for your lifestyle.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-[#8928A4] mb-2">Saving Strategies</h4>
                <p className="text-sm text-gray-600">Discover effective ways to save money and build financial security.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-[#8928A4] mb-2">Digital Identity</h4>
                <p className="text-sm text-gray-600">Everything you need to know about Digital IDs and secure authentication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSupportPage;
