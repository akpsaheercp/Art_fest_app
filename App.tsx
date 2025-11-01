import React from 'react';
import { MainLayout } from './components/MainLayout';
import { useAppState } from './hooks/useAppState';

function App() {
  const { isReady } = useAppState();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-zinc-900">
        <div className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Loading...</div>
      </div>
    );
  }

  return <MainLayout />;
}

export default App;
