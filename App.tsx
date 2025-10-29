
import React, { useState, useEffect } from 'react';
import { TABS } from './constants';
import Sidebar from './components/Sidebar';
import InitializationPage from './pages/Initialization';
import DataEntryPage from './pages/DataEntry';
import SchedulePage from './pages/Schedule';
import TabulationPage from './pages/Tabulation';
import ResultsPage from './pages/Results';
import PointsPage from './pages/Points';
import ReportsPage from './pages/Reports';
import AboutPage from './pages/About';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.INITIALIZATION);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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


  const renderContent = () => {
    switch (activeTab) {
      case TABS.INITIALIZATION:
        return <InitializationPage />;
      case TABS.DATA_ENTRY:
        return <DataEntryPage />;
      case TABS.SCHEDULE:
        return <SchedulePage />;
      case TABS.TABULATION:
        return <TabulationPage />;
      case TABS.RESULTS:
        return <ResultsPage />;
      case TABS.POINTS:
        return <PointsPage />;
      case TABS.REPORTS:
        return <ReportsPage />;
      case TABS.ABOUT:
        return <AboutPage />;
      default:
        return <InitializationPage />;
    }
  };

  return (
    <div className="flex h-screen font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;