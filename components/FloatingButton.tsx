import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-24 right-4 bg-wa-green hover:bg-wa-greenDark text-white p-4 rounded-2xl shadow-lg transition-colors duration-200 z-30 flex items-center justify-center"
    >
      <Plus className="w-6 h-6 text-black font-bold" strokeWidth={3} />
    </button>
  );
};

export default FloatingButton;