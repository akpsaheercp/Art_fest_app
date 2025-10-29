
import React, { useState, useEffect } from 'react';
import { TABS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DataEntryPage from './pages/DataEntry';
import SchedulePage from './pages/Schedule';
import TabulationPage from './pages/Tabulation';
import PointsPage from './pages/Points';
import ReportsPage from './pages/Reports';
import DashboardPage from './pages/Dashboard';

import GeneralSettings from './pages/initialization/GeneralSettings';
import TeamsAndCategories from './pages/initialization/TeamsAndCategories';
import ItemsManagement from './pages/initialization/ItemsManagement';
import GradePoints from './pages/initialization/GradePoints';
import CodeLetters from './pages/initialization/CodeLetters';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.DASHBOARD);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };


  const renderContent = () => {
    switch (activeTab) {
      case TABS.GENERAL_SETTINGS:
        return <GeneralSettings />;
      case TABS.TEAMS_CATEGORIES:
        return <TeamsAndCategories />;
      case TABS.ITEMS:
        return <ItemsManagement />;
      case TABS.GRADE_POINTS:
        return <GradePoints />;
      case TABS.CODE_LETTERS:
        return <CodeLetters />;
      case TABS.DATA_ENTRY:
        return <DataEntryPage />;
      case TABS.SCHEDULE:
        return <SchedulePage />;
      case TABS.TABULATION:
        return <TabulationPage />;
      case TABS.POINTS:
        return <PointsPage />;
      case TABS.REPORTS:
        return <ReportsPage />;
      case TABS.DASHBOARD:
        return <DashboardPage setActiveTab={handleSetActiveTab} />;
      default:
        return <DashboardPage setActiveTab={handleSetActiveTab} />;
    }
  };

  return (
    <div className="relative min-h-screen md:flex font-sans bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen max-w-full overflow-hidden">
        <Header 
            pageTitle={activeTab} 
            onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;