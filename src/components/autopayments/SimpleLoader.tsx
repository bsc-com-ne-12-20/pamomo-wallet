import React from 'react';

interface SimpleLoaderProps {
  size?: 'small' | 'medium' | 'large';
}

export const SimpleLoader: React.FC<SimpleLoaderProps> = ({ size = 'medium' }) => {
  const dimensions = {
    small: 'h-6 w-6 border-t-2 border-b-2',
    medium: 'h-10 w-10 border-t-3 border-b-3',
    large: 'h-12 w-12 border-t-4 border-b-4',
  };

  return (
    <div className="flex justify-center items-center py-6">
      <div className={`animate-spin rounded-full ${dimensions[size]} border-[#8928A4]`}></div>
    </div>
  );
};

export default SimpleLoader;