'use client';

import { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function Card({ card, onClick, selected, className = '' }: CardProps) {
  const getColorClass = () => {
    if (card.value === 'wild') return 'bg-gradient-to-br from-purple-500 to-pink-500';
    if (card.value === 'skip') return 'bg-gray-800';
    
    switch (card.color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-400';
      default: return 'bg-gray-500';
    }
  };

  const getDisplayValue = () => {
    if (card.value === 'wild') return 'W';
    if (card.value === 'skip') return 'S';
    return card.value;
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative w-16 h-24 rounded-lg shadow-lg cursor-pointer transition-all duration-200
        flex items-center justify-center text-white font-bold text-2xl
        ${getColorClass()}
        ${selected ? 'ring-4 ring-white transform -translate-y-2' : 'hover:transform hover:-translate-y-1'}
        ${className}
      `}
    >
      <span className="drop-shadow-lg">{getDisplayValue()}</span>
      {card.value === 'skip' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-1 bg-white transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
