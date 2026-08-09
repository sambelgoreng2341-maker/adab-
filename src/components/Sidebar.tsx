import React from 'react';
import { LayoutDashboard, Users, ClipboardEdit, ShieldAlert, LogOut, BookOpen, FileText, Printer, Moon, Sun, X } from 'lucide-react';
import { motion } from 'motion/react';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = true, onClose, isDarkMode, toggleDarkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'record', label: 'Catat Pelanggaran', icon: ClipboardEdit },
    { id: 'students', label: 'Data Santri', icon: Users },
    { id: 'student_report', label: 'Laporan Santri', icon: FileText },
    { id: 'history', label: 'Riwayat Lengkap', icon: ShieldAlert },
    { id: 'rapot', label: 'Rapot Santri', icon: Printer },
    { id: 'rules', label: 'Aturan & Poin', icon: BookOpen },
  ];

  return (
    <aside 
      className={`w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center border border-teal-100/50 dark:border-teal-800/50">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">Kedisiplinan<br/>Santri</h1>
          </div>
        </div>
        <button 
          className="lg:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive 
                  ? 'text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-900/20' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-800/50 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-teal-500' : 'bg-neutral-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'left-4.5 translate-x-4' : 'left-0.5'}`} />
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-5 h-5" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
};
