
import React, { useState } from 'react';
import { TABS, SIDEBAR_GROUPS, INITIALIZATION_SUB_PAGE_ICONS } from '../constants';
import { Sun, Moon, X, Search, UserCircle, LayoutDashboard, UserPlus, Calendar, Edit3, BarChart2, FileText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: { [key: string]: React.ElementType } = {
    [TABS.DASHBOARD]: LayoutDashboard,
    [TABS.GENERAL_SETTINGS]: INITIALIZATION_SUB_PAGE_ICONS['General Settings'],
    [TABS.TEAMS_CATEGORIES]: INITIALIZATION_SUB_PAGE_ICONS['Teams & Categories'],
    [TABS.ITEMS]: INITIALIZATION_SUB_PAGE_ICONS['Items'],
    [TABS.GRADE_POINTS]: INITIALIZATION_SUB_PAGE_ICONS['Grade Points'],
    [TABS.CODE_LETTERS]: INITIALIZATION_SUB_PAGE_ICONS['Code Letters'],
    [TABS.DATA_ENTRY]: UserPlus,
    [TABS.SCHEDULE]: Calendar,
    [TABS.TABULATION]: Edit3,
    [TABS.POINTS]: BarChart2,
    [TABS.REPORTS]: FileText,
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, toggleTheme, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onClose(); // Close sidebar on mobile after navigation
  };
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const renderNavItem = (tab: string) => {
    const Icon = iconMap[tab];
    const isMatch = tab.toLowerCase().includes(lowerCaseSearchTerm);
    
    if (!isMatch) return null;

    return (
      <button
        key={tab}
        onClick={() => handleTabClick(tab)}
        title={tab}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
        ${
          activeTab === tab
            ? 'bg-teal-500 text-white shadow-md'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <div className="flex items-center">
          {Icon && <Icon className="mr-3 h-5 w-5" />}
          <span>{tab}</span>
        </div>
        {tab === TABS.TABULATION && (
           <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" title="3 Pending Items">
              3
           </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3" title="Admin User profile">
          <UserCircle className="h-10 w-10 text-zinc-500 dark:text-zinc-400" />
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Admin User</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manager</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="md:hidden p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close menu"
        >
           <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Filter navigation..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Filter sidebar navigation"
          />
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {SIDEBAR_GROUPS.map(group => {
            const hasVisibleItems = group.tabs.some(tab => tab.toLowerCase().includes(lowerCaseSearchTerm));

            if (!hasVisibleItems) return null;

            return (
                <div key={group.title}>
                    <div className="px-3 pt-4 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{group.title}</div>
                    <div className="space-y-1">
                        {group.tabs.map(tab => renderNavItem(tab))}
                    </div>
                </div>
            );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
         <div className="text-xs text-zinc-400">
            © 2024 Art Fest Manager
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;