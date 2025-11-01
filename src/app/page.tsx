'use client';

import { useState } from 'react';
import { CheckSquare, LayoutDashboard, Headphones, Settings, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
import Image from 'next/image';


export default function TaskmySidebar() {
  const [activeItem, setActiveItem] = useState('tarefas');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const menuItems = [
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard },
    { id: 'suporte', label: 'Suporte', icon: Headphones },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const userProfile = {
    name: 'João Silva',
    email: 'joao@taskmy.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  };

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
              <h1 className="text-2xl font-bold text-indigo-400">Taskmy</h1>
              <p className="text-sm text-slate-400 mt-1">Gerenciador de Tarefas</p>
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
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${isMinimized ? 'justify-center' : ''}`}
                title={isMinimized ? item.label : ''}
              >
                <Icon size={20} />
                {!isMinimized && <span>{item.label}</span>}
              </button>
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
              <div className={`absolute bottom-full mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden ${
                isMinimized ? 'left-full ml-2 w-48' : 'left-0 right-0'
              }`}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <User size={18} />
                  <span className="text-sm">Perfil</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors">
                  <LogOut size={18} />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Preview */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            {menuItems.find(item => item.id === activeItem)?.label}
          </h2>
          <p className="text-slate-400">
            Conteúdo da seção {menuItems.find(item => item.id === activeItem)?.label.toLowerCase()} será exibido aqui.
          </p>
        </div>
      </div>
    </div>
  );
}