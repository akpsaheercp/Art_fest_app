
import React from 'react';
import { TABS } from '../constants';
import { Home, UserPlus, Calendar, Edit3, Award, BarChart2, FileText, Info, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  toggleTheme: () => void;
}

const iconMap: { [key: string]: React.ElementType } = {
    [TABS.INITIALIZATION]: Home,
    [TABS.DATA_ENTRY]: UserPlus,
    [TABS.SCHEDULE]: Calendar,
    [TABS.TABULATION]: Edit3,
    [TABS.RESULTS]: Award,
    [TABS.POINTS]: BarChart2,
    [TABS.REPORTS]: FileText,
    [TABS.ABOUT]: Info,
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-lg flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">Art Fest</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manager</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {Object.values(TABS).map((tab) => {
          const Icon = iconMap[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                ${
                  activeTab === tab
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
            >
              {Icon && <Icon className="mr-3 h-5 w-5" />}
              {tab}
            </button>
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
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;