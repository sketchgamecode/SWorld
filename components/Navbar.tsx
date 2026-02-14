import React from 'react';
import { ShieldCheck, LayoutDashboard, Image } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'admin' | 'generate';
  onNavigate: (page: 'home' | 'admin' | 'generate') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <ShieldCheck className="h-8 w-8 text-blue-400 mr-2" />
            <span className="font-bold text-xl tracking-tight">数智安防世界</span>
          </div>
          <div className="flex space-x-4">
             <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              产品展厅
            </button>
            <button
              onClick={() => onNavigate('generate')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'generate' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Image className="h-4 w-4 mr-1.5" />
              AI素材生成
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'admin' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              管理后台
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
