import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, UserCircle, Bell, LogOut, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
    handleLogout: () => void;
    currentUser: User | null;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick, handleLogout, currentUser }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                
                <button className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Notifications">
                         <Bell className="h-5 w-5" />
                </button>
                
                {/* User Profile Widget */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(prev => !prev)} 
                        className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-haspopup="true"
                        aria-expanded={isProfileOpen}
                    >
                        <UserCircle className="h-8 w-8 text-zinc-600 dark:text-zinc-300" />
                        <div className="hidden lg:block">
                            <p className="text-sm font-medium text-left">{currentUser?.username}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser?.role}</p>
                        </div>
                        <ChevronDown size={16} className={`text-zinc-500 dark:text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-20 border border-zinc-200 dark:border-zinc-700">
                             <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{currentUser?.username}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser?.role}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    handleLogout();
                                    setIsProfileOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;