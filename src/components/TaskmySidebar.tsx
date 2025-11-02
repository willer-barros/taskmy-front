'use client';

import { useState } from 'react';
import { CheckSquare, LayoutDashboard, Headphones, Settings, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function TaskmySidebar({ children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const menuItems = [
    { id: 'task', label: 'Tarefas', icon: CheckSquare, href: '/task' },
    { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, href: '/dashboards' },
    { id: 'suporte', label: 'Suporte', icon: Headphones, href: '/suporte' },
    { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
  ];

  const userProfile = {
    name: 'João Silva',
    email: 'joao@taskmy.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  };

  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#1e293b]">
      {/* Sidebar */}
      <div 
        className={`bg-slate-900 border-r border-slate-700 flex flex-col transition-all duration-300 ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {!isMinimized && (
             <div>
                            <Image 
                                src="/taskMy_branco_logo_inicial.svg" 
                                                alt="Logo Willer Barros"
                                                width={120} // Defina a largura
                                                height={100} // Defina a altura
                            
                            />
                                
                        </div>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${isMinimized ? 'justify-center' : ''}`}
                title={isMinimized ? item.label : ''}
              >
                <Icon size={20} />
                {!isMinimized && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors ${
                isMinimized ? 'justify-center' : ''
              }`}
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"
              />
              {!isMinimized && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{userProfile.name}</p>
                    <p className="text-xs text-slate-400">{userProfile.email}</p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className={`absolute bottom-full mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 ${
                isMinimized ? 'left-full ml-2 w-48' : 'left-0 right-0'
              }`}>
                <a
                  href="/perfil"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <User size={18} />
                  <span className="text-sm">Perfil</span>
                </a>
                <button
                  onClick={() => {
                    // Adicione aqui a lógica de logout
                    console.log('Logout clicked');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}