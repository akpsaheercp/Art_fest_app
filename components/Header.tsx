import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, LogOut, ChevronDown, Sun, Moon, Laptop, Search, X, Command, ArrowLeft, SlidersHorizontal, Filter, LayoutList, Users, Layers, Milestone, Gavel, Settings as SettingsIcon, Hash, Medal, Info, Palette, BookText, Database, ShieldCheck, LayoutGrid, User as UserIcon, ClipboardList, Wifi, Maximize2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { useFirebase } from '../hooks/useFirebase';
import { PAGES_WITH_GLOBAL_FILTERS, TABS, TAB_DISPLAY_NAMES } from '../constants';
import UniversalFilter from './UniversalFilter';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
    handleLogout: () => void;
    currentUser: User | null;
    theme: 'light' | 'dark' | 'system';
    toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
    isVisible?: boolean; 
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick, handleLogout, currentUser, theme, toggleTheme, isVisible = true }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    
    const profileRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);
    
    const { 
        state, setGlobalFilters, globalSearchTerm, setGlobalSearchTerm, 
        dataEntryView, setDataEntryView,
        itemsSubView, setItemsSubView,
        gradeSubView, setGradeSubView,
        judgesSubView, setJudgesSubView,
        settingsSubView, setSettingsSubView
    } = useFirebase();
    
    const showGlobalFilters = PAGES_WITH_GLOBAL_FILTERS.includes(pageTitle) || pageTitle === TABS.SCHEDULE;

    const isSearchablePage = [
        TABS.ITEMS, TABS.DATA_ENTRY, TABS.SCHEDULE, 
        TABS.SCORING_RESULTS, TABS.POINTS, TABS.GRADE_POINTS,
        TABS.ITEM_TIMER
    ].includes(pageTitle);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
                setIsThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const subNavOptions = useMemo(() => {
        switch(pageTitle) {
            case TABS.DATA_ENTRY:
                return [
                    { id: 'ITEMS', label: 'BY ITEMS', icon: ClipboardList, active: dataEntryView === 'ITEMS', onClick: () => setDataEntryView('ITEMS'), color: 'emerald' },
                    { id: 'PARTICIPANTS', label: 'BY PARTICIPANTS', icon: Users, active: dataEntryView === 'PARTICIPANTS', onClick: () => setDataEntryView('PARTICIPANTS'), color: 'emerald' }
                ];
            case TABS.ITEMS:
                return [
                    { id: 'ITEMS', label: 'ITEM REGISTRY', icon: LayoutList, active: itemsSubView === 'ITEMS', onClick: () => setItemsSubView('ITEMS'), color: 'teal' },
                    { id: 'PARTICIPANTS', label: 'PARTICIPANTS REGISTRY', icon: Users, active: itemsSubView === 'PARTICIPANTS', onClick: () => setItemsSubView('PARTICIPANTS'), color: 'teal' }
                ];
            case TABS.GRADE_POINTS:
                return [
                    { id: 'CODES', label: 'REGISTRY & LOTS', icon: Hash, active: gradeSubView === 'CODES', onClick: () => setGradeSubView('CODES'), color: 'amber' },
                    { id: 'GRADES', label: 'POINTS RULES', icon: Medal, active: gradeSubView === 'GRADES', onClick: () => setGradeSubView('GRADES'), color: 'amber' }
                ];
            case TABS.JUDGES_MANAGEMENT:
                return [
                    { id: 'ASSIGNMENTS', label: 'ASSIGNMENTS', icon: ShieldCheck, active: judgesSubView === 'ASSIGNMENTS', onClick: () => setJudgesSubView('ASSIGNMENTS'), color: 'indigo' },
                    { id: 'REGISTRY', label: 'JUDGE REGISTRY', icon: UserIcon, active: judgesSubView === 'REGISTRY', onClick: () => setJudgesSubView('REGISTRY'), color: 'indigo' }
                ];
            case TABS.GENERAL_SETTINGS:
                return [
                    { id: 'details', label: 'EVENT DETAILS', icon: Info, active: settingsSubView === 'details', onClick: () => setSettingsSubView('details'), color: 'zinc' },
                    { id: 'display', label: 'DISPLAY & LAYOUT', icon: Palette, active: settingsSubView === 'display', onClick: () => setSettingsSubView('display'), color: 'zinc' },
                    { id: 'users', label: 'USERS & ACCESS', icon: Users, active: settingsSubView === 'users', onClick: () => setSettingsSubView('users'), color: 'indigo' },
                    { id: 'instructions', label: 'INSTRUCTIONS', icon: BookText, active: settingsSubView === 'instructions', onClick: () => setSettingsSubView('instructions'), color: 'zinc' },
                    { id: 'data', label: 'CONTINUITY', icon: Database, active: settingsSubView === 'data', onClick: () => setSettingsSubView('data'), color: 'zinc' }
                ];
            default: return [];
        }
    }, [pageTitle, dataEntryView, itemsSubView, gradeSubView, judgesSubView, settingsSubView, setDataEntryView, setItemsSubView, setGradeSubView, setJudgesSubView, setSettingsSubView]);

    return (
        <header className={`fixed md:relative top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-in-out bg-amazio-bg border-b border-white/5 ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'} h-14 md:h-16 flex items-center px-6`}>
            
            <div className="flex items-center gap-6 flex-shrink-0">
                <button onClick={onMenuClick} className="lg:hidden p-1 rounded-lg text-zinc-400"><Menu size={20} /></button>
                <div className="flex items-center gap-2.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                    <Wifi size={10} className="text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Synced</span>
                </div>
            </div>

            {/* Main Horizontal Sub-Navigation */}
            <div className="flex-grow flex justify-center overflow-x-auto no-scrollbar px-4">
                <div className="flex items-center gap-1">
                    {subNavOptions.map(opt => {
                        const Icon = opt.icon;
                        const activeColors: Record<string, string> = {
                            emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            teal: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
                            amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                            zinc: 'bg-white/5 text-white border-white/10'
                        };
                        return (
                            <button
                                key={opt.id}
                                onClick={opt.onClick}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${opt.active ? activeColors[opt.color] || 'bg-white/10 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <Icon size={14} strokeWidth={2.5} />
                                <span className="hidden sm:inline">{opt.label}</span>
                                {opt.active && <div className={`w-1 h-1 rounded-full ${opt.color === 'zinc' ? 'bg-white' : `bg-${opt.color}-500`}`}></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
                {isSearchablePage && (
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Search size={18}/></button>
                )}
                {showGlobalFilters && <UniversalFilter pageTitle={pageTitle} />}
                
                <button className="p-2 text-zinc-500 hover:text-white transition-colors hidden sm:block"><Maximize2 size={18}/></button>
                
                <div className="relative" ref={themeRef}>
                    <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        {theme === 'dark' ? <Moon size={18}/> : <Sun size={18}/>}
                    </button>
                    {isThemeMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-[#121412] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50">
                            <button onClick={() => { toggleTheme('light'); setIsThemeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-2"><Sun size={14}/> Light</button>
                            <button onClick={() => { toggleTheme('dark'); setIsThemeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-2"><Moon size={14}/> Dark</button>
                        </div>
                    )}
                </div>

                <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 pl-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{currentUser?.username.substring(0,2)}</span>
                        <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                            {currentUser?.username.substring(0,2).toUpperCase()}
                        </div>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#121412] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                <p className="text-xs font-black text-white uppercase truncate">{currentUser?.username}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{currentUser?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"><LogOut size={14}/> Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;