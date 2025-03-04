import React from 'react';

interface CardProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  type: string;
}

const Card: React.FC<CardProps> = ({ cardNumber, cardHolder, expiryDate, type }) => {
  return (
    <div className="w-full max-w-sm h-56 m-auto rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-105">
      <div className="w-full h-full bg-gradient-to-tr from-[#8928A4] to-purple-800 rounded-xl p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Virtual Card</span>
            <span className="text-lg font-bold">{type}</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xl font-bold">P</span>
          </div>
        </div>
        
        <div>
          <span className="text-xl tracking-widest">{cardNumber}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Card Holder</span>
            <span className="font-medium">{cardHolder}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Expires</span>
            <span className="font-medium">{expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;