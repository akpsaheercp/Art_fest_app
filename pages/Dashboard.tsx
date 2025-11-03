import React, { useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Users, ClipboardList, Calendar, Trophy, UserPlus, Edit3, BarChart2, Settings, Crown } from 'lucide-react';
import { TABS } from '../constants';
import { ItemType, ResultStatus } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string, onClick?: () => void }> = ({ icon: Icon, title, value, color, onClick }) => (
  <div onClick={onClick} className={`p-4 rounded-xl shadow-md flex items-center gap-4 bg-white dark:bg-zinc-800/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}>
    <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-500/20`}>
      <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
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
    resultsDeclared: state.results.filter(r => r.status === ResultStatus.DECLARED).length
  };

  const teamPoints = useMemo(() => {
    const { teams, results, items, participants, gradePoints } = state;
    const tPoints: { [key: string]: number } = {};
    teams.forEach(t => tPoints[t.id] = 0);

    results.forEach(result => {
        if (result.status !== ResultStatus.DECLARED) return;
        const item = items.find(i => i.id === result.itemId);
        if (!item) return;

        result.winners.forEach(winner => {
            const participant = participants.find(p => p.id === winner.participantId);
            if (!participant) return;

            let pointsWon = 0;
            if (winner.position === 1) pointsWon += item.points.first;
            else if (winner.position === 2) pointsWon += item.points.second;
            else if (winner.position === 3) pointsWon += item.points.third;

            if (winner.gradeId) {
                const gradeConfig = item.type === ItemType.SINGLE ? gradePoints.single : gradePoints.group;
                const grade = gradeConfig.find(g => g.id === winner.gradeId);
                if (grade) pointsWon += grade.points;
            }
            
            if (tPoints[participant.teamId] !== undefined) {
                tPoints[participant.teamId] += pointsWon;
            }
        });
    });
    
    return teams
        .map(team => ({ ...team, points: tPoints[team.id] || 0 }))
        .sort((a, b) => b.points - a.points);
  }, [state.teams, state.results, state.items, state.participants, state.gradePoints]);

  const topScore = teamPoints[0]?.points || 0;

  return (
    <div className="space-y-8">
       {/* Hero Banner */}
       <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl">
          <h1 className="text-4xl font-bold">{state.settings.heading}</h1>
          <p className="mt-2 text-lg text-indigo-100 opacity-90">{state.settings.description}</p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <Card title="Team Point Status">
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {teamPoints.length > 0 ? teamPoints.map((team, index) => {
                        const progress = topScore > 0 ? (team.points / topScore) * 100 : 0;
                        const isWinner = index === 0 && team.points > 0;
                        return (
                            <div key={team.id} className={`p-3 rounded-lg transition-all ${isWinner ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800/50'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        {isWinner ? (
                                            <Crown className="w-6 h-6 text-amber-500" />
                                        ) : (
                                            <span className="w-6 text-center font-bold text-zinc-500 dark:text-zinc-400">{index + 1}</span>
                                        )}
                                        <span className="font-bold text-md text-zinc-800 dark:text-zinc-100">{team.name}</span>
                                    </div>
                                    <span className={`font-bold text-lg ${isWinner ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{team.points} pts</span>
                                </div>
                                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                                    <div 
                                        className={`${isWinner ? 'bg-amber-400' : 'bg-indigo-500'} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                                        style={{ width: `${progress}%` }}
                                        title={`${team.points} points`}
                                    ></div>
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">No points recorded yet.</p>
                    )}
                </div>
              </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
              <Card title="Event Overview">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      <StatCard icon={Users} title="Total Participants" value={stats.participants} color="indigo" onClick={() => setActiveTab(TABS.DATA_ENTRY)} />
                      <StatCard icon={Users} title="Total Teams" value={stats.teams} color="sky" onClick={() => setActiveTab(TABS.TEAMS_CATEGORIES)} />
                      <StatCard icon={ClipboardList} title="Total Items" value={stats.items} color="amber" onClick={() => setActiveTab(TABS.ITEMS)} />
                      <StatCard icon={Calendar} title="Events Scheduled" value={stats.scheduled} color="violet" onClick={() => setActiveTab(TABS.SCHEDULE)} />
                      <StatCard icon={Trophy} title="Results Declared" value={stats.resultsDeclared} color="rose" onClick={() => setActiveTab(TABS.TABULATION)} />
                  </div>
              </Card>
          </div>
          
           <div className="lg:col-span-5">
             <Card title="About Art Fest Manager">
                 <p className="text-sm text-zinc-700 dark:text-zinc-300">
                     This is a comprehensive tool to manage cultural and artistic festivals. 
                     From initial setup to participant registration, AI-powered scheduling, tabulation, and reporting, this app covers every aspect of festival organization.
                 </p>
             </Card>
           </div>
      </div>
    </div>
  );
};

export default DashboardPage;