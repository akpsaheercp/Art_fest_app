
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { TABS } from '../constants';
import { useAppState } from '../hooks/useAppState';
import Card from './Card';

const WelcomeCard: React.FC = () => {
    const { settings } = useAppState();
    return (
        <Card title="Welcome Manager!">
            <p className="text-zinc-600 dark:text-zinc-300">
                {settings.description}
            </p>
        </Card>
    );
};

export const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
    const [theme, setTheme] = useState('light');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || 
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setTheme('light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const renderContent = () => {
        switch (activeTab) {
            case TABS.DASHBOARD:
                return <WelcomeCard />;
            default:
                return <div className="text-center p-8">Selected: {activeTab}</div>;
        }
    };

    return (
        <div className={`flex h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}>
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header pageTitle={activeTab} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                   {renderContent()}
                </main>
            </div>
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};
