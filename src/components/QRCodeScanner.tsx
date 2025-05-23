import React, { useState, useEffect } from 'react';
import { QrCode, X, AlertCircle } from 'lucide-react';
import { QrReader } from 'react-qr-reader';
import { useNavigate } from 'react-router-dom';

interface QRCodeScannerProps {
  onScan?: (result: string) => void;
  isAuthenticated: boolean;
  isVerified: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, isAuthenticated, isVerified }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Hide notification after 5 seconds
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Clear notification when toggling the scanner
    setShowNotification(false);
  };
  const handleScanResult = (result: any, error: any) => {
    if (result) {
      const scannedText = result.getText();
      processScannedResult(scannedText);
      if (onScan) {
        onScan(scannedText);
      }
      setIsOpen(false);
    } else if (error) {
      console.error('QR Scan Error:', error);
    }
  };    const processScannedResult = (text: string) => {
    // Email regex pattern
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    // Agent code pattern (6-digit number)
    const agentCodePattern = /^\d{6}$/;
    
    if (emailPattern.test(text)) {
      // Check if we're on the external wallet transfer page
      const isOnExternalWalletPage = window.location.pathname.includes('/external-transfer');
      
      if (isOnExternalWalletPage) {
        // If on external wallet page and scanning an email, ask if user wants to send from Pamomo wallet instead
        if (window.confirm('Scanning an email address. Would you like to send money from your Pamomo wallet instead of an external wallet?')) {
          navigate('/send', { state: { recipient: text } });
        } else {
          // User chose to stay on external wallet page, so update the current page with the scanned email
          navigate('/external-transfer', { state: { recipient: text } });
        }
      } else {
        // Standard behavior - navigate to send money with pre-filled recipient
        navigate('/send', { state: { recipient: text } });
      }
    } else if (agentCodePattern.test(text)) {
      // If it's a 6-digit code, navigate to withdraw money with pre-filled agent code
      navigate('/withdraw', { state: { agentCode: text } });
    } else {
      // If we can't determine the type, show a more descriptive notification
      setNotification(`Unrecognized QR code format: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
      setShowNotification(true);
      console.log("Unknown QR code format:", text);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would use a QR code library to decode
      console.log("QR code image uploaded:", file.name);
      // For demo purposes, just close the modal
      setIsOpen(false);
    }
  };  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Only show scanner button when authenticated and verified */}
      {isAuthenticated && isVerified && !isOpen && (
        <button
          onClick={handleToggle}
          className="bg-[#8928A4] text-white p-4 rounded-full shadow-lg hover:bg-[#722389] transition-colors flex items-center"
          aria-label="Scan QR Code"
        >
          <QrCode size={24} />
        </button>
      )}
      
      {isAuthenticated && isVerified && isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col border border-gray-200">
          {/* QR Scanner header */}
          <div className="bg-[#8928A4] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <QrCode size={18} className="mr-2" />
              <h3 className="font-medium">QR Code Scanner</h3>
            </div>
            <button 
              onClick={handleToggle} 
              className="text-white/80 hover:text-white"
              aria-label="Close QR scanner"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* QR Scanner content */}
          <div>
            <div className="p-4">
              <div className="mb-4">                <div style={{ width: '100%' }}>
                  <QrReader
                    onResult={handleScanResult}
                    constraints={{ facingMode: 'environment' }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="qr-upload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Or upload a QR code image
                </label>
                <input
                  type="file"
                  id="qr-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8928A4] file:text-white hover:file:bg-[#7a2391]"
                />
              </div>
              <button
                onClick={handleToggle}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Notification for unknown QR format */}
          {showNotification && notification && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md mt-4 mx-4">
              <div className="flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {notification}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
