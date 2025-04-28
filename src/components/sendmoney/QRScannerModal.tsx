import React from 'react';
import { QrReader } from 'react-qr-reader';

interface QRScannerModalProps {
  show: boolean;
  onClose: () => void;
  onScanResult: (result: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
  show, onClose, onScanResult, handleImageUpload 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Scan QR Code</h2>
        <div className="relative mb-4">
          <QrReader
            onResult={(result, error) => {
              if (result) {
                onScanResult(result.getText());
              } else if (error) {
                console.error('QR Scan Error:', error);
              }
            }}
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
          onClick={onClose}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScannerModal;