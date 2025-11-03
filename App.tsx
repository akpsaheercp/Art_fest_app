import React, { useState, useEffect, useCallback } from 'react';
import { TABS } from './constants';
import { useAppState } from './hooks/useAppState';
import { User, UserRole } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DataEntryPage from './pages/DataEntry';
import SchedulePage from './pages/Schedule';
import JudgementPage from './pages/JudgementPage';
import TabulationPage from './pages/Tabulation';
import PointsPage from './pages/Points';
import ReportsPage from './pages/Reports';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

import GeneralSettings from './pages/initialization/GeneralSettings';
import TeamsAndCategories from './pages/initialization/TeamsAndCategories';
import ItemsManagement from './pages/initialization/ItemsManagement';
import GradePoints from './pages/initialization/GradePoints';
import CodeLetters from './pages/initialization/CodeLetters';
import JudgesManagement from './pages/initialization/JudgesManagement';

const App: React.FC = () => {
  const { state } = useAppState();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const userId = sessionStorage.getItem('currentUserId');
    if (!userId) return null;
    return state.users.find(u => u.id === userId) || null;
  });
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

  const hasPermission = useCallback((tab: string): boolean => {
    if (!currentUser) return false;
    const userPermissions = state.permissions[currentUser.role];
    return userPermissions ? userPermissions.includes(tab) : false;
  }, [currentUser, state.permissions]);

  useEffect(() => {
    if (currentUser && !hasPermission(activeTab)) {
      setActiveTab(TABS.DASHBOARD);
    }
  }, [currentUser, activeTab, hasPermission]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSetActiveTab = (tab: string) => {
    if (hasPermission(tab)) {
      setActiveTab(tab);
    }
  };

  const handleLogin = (user: string, pass: string): boolean => {
    const foundUser = state.users.find(u => u.username === user && u.password === pass);
    if (foundUser) {
        sessionStorage.setItem('currentUserId', foundUser.id);
        setCurrentUser(foundUser);
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUserId');
    setCurrentUser(null);
  };

  const renderContent = () => {
    if (!hasPermission(activeTab)) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600">Permission Denied</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">You do not have access to this page.</p>
        </div>
      );
    }
    
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
      case TABS.JUDGES_MANAGEMENT:
        return <JudgesManagement />;
      case TABS.DATA_ENTRY:
        return <DataEntryPage currentUser={currentUser} />;
      case TABS.SCHEDULE:
        return <SchedulePage />;
      case TABS.JUDGEMENT:
        return <JudgementPage />;
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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="relative min-h-screen md:flex font-sans bg-zinc-50 dark:bg-zinc-950">
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
        handleLogout={handleLogout}
        currentUser={currentUser}
        hasPermission={hasPermission}
      />

      <div className="flex-1 flex flex-col h-screen max-w-full overflow-hidden">
        <Header 
            pageTitle={activeTab} 
            onMenuClick={() => setIsSidebarOpen(true)}
            handleLogout={handleLogout}
            currentUser={currentUser}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;