
import React from 'react';
import { Menu, Search, UserCircle, Bell } from 'lucide-react';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick }) => {
    return (
        <header className="flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-sm z-10">
            {/* Left side: Mobile Menu and Page Title */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick} 
                    className="md:hidden p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 hidden sm:block">{pageTitle}</h2>
            </div>

            {/* Right side: Search, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input 
                        type="search" 
                        placeholder="Quick Jump..."
                        className="w-full max-w-xs pl-10 pr-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
                
                {/* User Profile Widget */}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Notifications">
                         <Bell className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <UserCircle className="h-8 w-8 text-zinc-600 dark:text-zinc-300" />
                        <div className="hidden lg:block">
                            <p className="text-sm font-medium">Admin</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manager</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;