import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, LogOut, Sun, Moon, Search, Maximize2, ChevronDown, ClipboardList, Users, LayoutList, Hash, Medal, ShieldCheck, User as UserIcon, Info, Palette, BookText, Database, Calendar, Timer, Edit3, BarChart2, FileText, LayoutDashboard, Settings, Layers, ListTodo, Trophy, FileBadge } from 'lucide-react';
import { User } from '../types';
import { useFirebase } from '../hooks/useFirebase';
import { PAGES_WITH_GLOBAL_FILTERS, TABS } from '../constants';
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
    
    const profileRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);
    
    const { 
        dataEntryView, setDataEntryView,
        itemsSubView, setItemsSubView,
        gradeSubView, setGradeSubView,
        judgesSubView, setJudgesSubView,
        scheduleSubView, setScheduleSubView,
        pointsSubView, setPointsSubView,
        reportsSubView, setReportsSubView,
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
                    { id: 'ITEMS', label: 'ITEMS REGISTRY', icon: LayoutList, active: itemsSubView === 'ITEMS', onClick: () => setItemsSubView('ITEMS'), color: 'teal' },
                    { id: 'PARTICIPANTS', label: 'DELEGATE REGISTRY', icon: Users, active: itemsSubView === 'PARTICIPANTS', onClick: () => setItemsSubView('PARTICIPANTS'), color: 'teal' }
                ];
            case TABS.GRADE_POINTS:
                return [
                    { id: 'CODES', label: 'REGISTRY & LOTS', icon: Hash, active: gradeSubView === 'CODES', onClick: () => setGradeSubView('CODES'), color: 'amber' },
                    { id: 'GRADES', label: 'POINTS RULES', icon: Medal, active: gradeSubView === 'GRADES', onClick: () => setGradeSubView('GRADES'), color: 'amber' }
                ];
            case TABS.JUDGES_MANAGEMENT:
                return [
                    { id: 'ASSIGNMENTS', label: 'ASSIGNMENTS', icon: ShieldCheck, active: judgesSubView === 'ASSIGNMENTS', onClick: () => setJudgesSubView('ASSIGNMENTS'), color: 'indigo' },
                    { id: 'REGISTRY', label: 'OFFICIAL REGISTRY', icon: UserIcon, active: judgesSubView === 'REGISTRY', onClick: () => setJudgesSubView('REGISTRY'), color: 'indigo' }
                ];
            case TABS.SCHEDULE:
                return [
                    { id: 'MANAGE', label: 'MANAGE TIMELINE', icon: Calendar, active: scheduleSubView === 'MANAGE', onClick: () => setScheduleSubView('MANAGE'), color: 'purple' },
                    { id: 'CONFIG', label: 'VENUE CONFIG', icon: Settings, active: scheduleSubView === 'CONFIG', onClick: () => setScheduleSubView('CONFIG'), color: 'purple' }
                ];
            case TABS.SCORING_RESULTS:
                return [
                    { id: 'QUEUE', label: 'ADJUDICATION', icon: Edit3, active: true, onClick: () => {}, color: 'rose' },
                ];
            case TABS.POINTS:
                return [
                    { id: 'LEADERBOARD', label: 'LEADERBOARD', icon: Trophy, active: pointsSubView === 'LEADERBOARD', onClick: () => setPointsSubView('LEADERBOARD'), color: 'yellow' },
                    { id: 'INSIGHTS', label: 'POINT AUDIT', icon: Info, active: pointsSubView === 'INSIGHTS', onClick: () => setPointsSubView('INSIGHTS'), color: 'yellow' }
                ];
            case TABS.REPORTS:
                return [
                    { id: 'TEMPLATES', label: 'OFFICIAL FORMS', icon: FileText, active: reportsSubView === 'TEMPLATES', onClick: () => setReportsSubView('TEMPLATES'), color: 'cyan' },
                    { id: 'LOGISTICS', label: 'LOGISTICS DATA', icon: FileBadge, active: reportsSubView === 'LOGISTICS', onClick: () => setReportsSubView('LOGISTICS'), color: 'cyan' }
                ];
            case TABS.GENERAL_SETTINGS:
                return [
                    { id: 'details', label: 'EVENT DETAILS', icon: Info, active: settingsSubView === 'details', onClick: () => setSettingsSubView('details'), color: 'zinc' },
                    { id: 'display', label: 'DESIGN & LAYOUT', icon: Palette, active: settingsSubView === 'display', onClick: () => setSettingsSubView('display'), color: 'zinc' },
                    { id: 'users', label: 'USERS & ACCESS', icon: Users, active: settingsSubView === 'users', onClick: () => setSettingsSubView('users'), color: 'zinc' },
                    { id: 'data', label: 'SYSTEM CONTINUITY', icon: Database, active: settingsSubView === 'data', onClick: () => setSettingsSubView('data'), color: 'zinc' }
                ];
            default: return [];
        }
    }, [pageTitle, dataEntryView, itemsSubView, gradeSubView, judgesSubView, scheduleSubView, pointsSubView, reportsSubView, settingsSubView, setDataEntryView, setItemsSubView, setGradeSubView, setJudgesSubView, setScheduleSubView, setPointsSubView, setReportsSubView, setSettingsSubView]);

    return (
        <header className={`fixed md:relative top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-in-out bg-amazio-bg border-b border-white/5 ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'} h-14 md:h-16 flex items-center px-4 md:px-6`}>
            
            <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors"><Menu size={20} /></button>
            </div>

            <div className="flex-grow flex justify-center overflow-x-auto no-scrollbar px-2 md:px-4">
                <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-md">
                    {subNavOptions.map(opt => {
                        const Icon = opt.icon;
                        const activeColors: Record<string, string> = {
                            emerald: 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20',
                            teal: 'bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-500/20',
                            amber: 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20',
                            indigo: 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20',
                            rose: 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/20',
                            purple: 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20',
                            yellow: 'bg-yellow-600 text-white border-yellow-500 shadow-lg shadow-yellow-500/20',
                            cyan: 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20',
                            zinc: 'bg-zinc-700 text-white border-zinc-600 shadow-lg shadow-zinc-500/20'
                        };
                        return (
                            <button
                                key={opt.id}
                                onClick={opt.onClick}
                                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${opt.active ? activeColors[opt.color] || 'bg-white/10 text-white' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                            >
                                <Icon size={14} strokeWidth={2.5} />
                                <span className="hidden sm:inline">{opt.label}</span>
                                {opt.active && <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>}
                            </button>
                        );
                    })}
                    {subNavOptions.length === 0 && (
                         <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 opacity-40">Section Control Active</div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                {isSearchablePage && (
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors hidden sm:block"><Search size={18}/></button>
                )}
                {showGlobalFilters && <UniversalFilter pageTitle={pageTitle} />}
                
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hidden xs:inline">{currentUser?.username.substring(0,2)}</span>
                        <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                            {currentUser?.username.substring(0,2).toUpperCase()}
                        </div>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#121412] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <p className="text-xs font-black text-white uppercase truncate">{currentUser?.username}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{currentUser?.role}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors"><LogOut size={14}/> Sign Out</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;