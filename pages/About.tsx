

import React from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Users, ClipboardList, Calendar, Trophy, UserPlus, Edit3, BarChart2 } from 'lucide-react';
import { TABS } from '../constants';
// FIX: Import ResultStatus to check the status of a result.
import { ResultStatus } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string, onClick?: () => void }> = ({ icon: Icon, title, value, color, onClick }) => (
  <div onClick={onClick} className={`p-4 rounded-lg shadow-md flex items-center gap-4 bg-white dark:bg-zinc-800/50 ${onClick ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors' : ''}`}>
    <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/40`}>
      <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-300`} />
    </div>
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
    </div>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { state } = useAppState();

  const stats = {
    participants: state.participants.length,
    teams: state.teams.length,
    items: state.items.length,
    scheduled: state.schedule.length,
    // FIX: The 'declared' property on a result has been replaced by 'status'.
    resultsDeclared: state.results.filter(r => r.status === ResultStatus.DECLARED).length
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard icon={Users} title="Total Participants" value={stats.participants} color="teal" onClick={() => setActiveTab(TABS.DATA_ENTRY)} />
        <StatCard icon={Users} title="Total Teams" value={stats.teams} color="sky" />
        <StatCard icon={ClipboardList} title="Total Items" value={stats.items} color="amber" />
        <StatCard icon={Calendar} title="Events Scheduled" value={stats.scheduled} color="violet" onClick={() => setActiveTab(TABS.SCHEDULE)} />
        <StatCard icon={Trophy} title="Results Declared" value={stats.resultsDeclared} color="rose" onClick={() => setActiveTab(TABS.TABULATION)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab(TABS.DATA_ENTRY)} className="p-4 flex flex-col items-center justify-center text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    <UserPlus className="h-8 w-8 text-teal-500 mb-2" />
                    <span className="text-sm font-medium">Add Participant</span>
                </button>
                 <button onClick={() => setActiveTab(TABS.TABULATION)} className="p-4 flex flex-col items-center justify-center text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    <Edit3 className="h-8 w-8 text-teal-500 mb-2" />
                    <span className="text-sm font-medium">Enter Marks</span>
                </button>
                <button onClick={() => setActiveTab(TABS.POINTS)} className="p-4 flex flex-col items-center justify-center text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    <BarChart2 className="h-8 w-8 text-teal-500 mb-2" />
                    <span className="text-sm font-medium">View Points</span>
                </button>
            </div>
        </Card>
        <Card title="About Art Fest Manager">
            <p className="text-zinc-700 dark:text-zinc-300">
                This is a comprehensive tool to manage cultural and artistic festivals. 
                From initial setup to participant registration, AI-powered scheduling, tabulation, and reporting, this app covers every aspect of festival organization.
            </p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;