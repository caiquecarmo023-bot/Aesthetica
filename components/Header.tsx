import React from 'react';
import { Sparkles, Video } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-rose-500">
              Aesthetica AI
            </h1>
          </div>
          <nav className="flex gap-4">
            <button className="text-rose-900 hover:text-rose-600 font-medium transition-colors text-sm">
              Dashboard
            </button>
            <button className="text-rose-900 hover:text-rose-600 font-medium transition-colors text-sm">
              Histórico
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
