
import React from 'react';
import { MainLayout } from './components/MainLayout';
import { ConnectionStatus } from './components/ConnectionStatus';

const App: React.FC = () => {
  return (
    <>
      <MainLayout />
      <ConnectionStatus />
    </>
  );
};

export default App;
