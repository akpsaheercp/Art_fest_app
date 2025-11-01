
import React from 'react';
import { useAppState } from '../hooks/useAppState';
import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
    const { connectionStatus } = useAppState();

    return (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg transition-all duration-300 ${
            connectionStatus ? 'bg-green-500' : 'bg-red-500'
        }`}>
            {connectionStatus ? <Wifi size={16} /> : <WifiOff size={16} />}
            {connectionStatus ? 'Connected' : 'Connecting...'}
        </div>
    );
};
