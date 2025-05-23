import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';
import { QrReader } from 'react-qr-reader';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleScanResult = (result: any, error: any) => {
    if (result) {
      onScan(result.getText());
      setIsOpen(false);
    } else if (error) {
      console.error('QR Scan Error:', error);
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
  };
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="bg-[#8928A4] text-white p-4 rounded-full shadow-lg hover:bg-[#722389] transition-colors flex items-center"
          aria-label="Scan QR Code"
        >
          <QrCode size={24} />
        </button>
      )}
      
      {isOpen && (
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
              <div className="mb-4">
                <QrReader
                  onResult={handleScanResult}
                  constraints={{ facingMode: 'environment' }}
                  style={{ width: '100%' }}
                />
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
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
