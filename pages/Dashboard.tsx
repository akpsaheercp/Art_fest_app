import { Activity, ArrowRight, Award, Calendar, ClipboardList, Clock, Crown, ExternalLink, Flag, Monitor, Sparkles, TrendingUp, Trophy, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import Card from '../components/Card';
import { TABS } from '../constants';
import { useFirebase } from '../hooks/useFirebase';
import { ItemType, ResultStatus, UserRole } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, onClick?: () => void, delay?: number }> = ({ icon: Icon, title, value, onClick, delay = 0 }) => (
  <div 
    onClick={onClick} 
    className={`relative group p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-amazio-primary/5 dark:border-white/5 hover:border-amazio-secondary/30 dark:hover:border-amazio-accent/30 backdrop-blur-md transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 hover:-translate-y-1 hover:shadow-glass-light-hover dark:hover:shadow-neon cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amazio-secondary/10 dark:bg-amazio-secondary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-amazio-secondary/20 dark:group-hover:bg-amazio-accent/20 transition-colors duration-500"></div>
    
    <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent border border-amazio-primary/5 dark:border-white/5 text-amazio-secondary dark:text-amazio-accent group-hover:text-white group-hover:bg-amazio-secondary dark:group-hover:bg-amazio-secondary/80 transition-all duration-300 shadow-sm dark:shadow-lg">
                <Icon className="h-6 w-6" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-amazio-secondary dark:text-amazio-accent">
                <Activity size={16} />
            </div>
        </div>
        <div>
            <p className="text-3xl font-black text-amazio-primary dark:text-white tracking-tight mb-1 group-hover:text-amazio-primary dark:group-hover:text-amazio-cream transition-colors">{value}</p>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-600 dark:group-hover:text-zinc-300">{title}</p>
        </div>
    </div>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { state, currentUser } = useFirebase();

  const hasJudgeAccess = useMemo(() => {
      if (!state || !currentUser || currentUser.role !== UserRole.JUDGE || !currentUser.judgeId) return () => true;
      const myItemIds = new Set(
          state.judgeAssignments
              .filter(a => a.judgeIds.includes(currentUser.judgeId!))
              .map(a => a.itemId)
      );
      return (itemId: string) => myItemIds.has(itemId);
  }, [state?.judgeAssignments, currentUser]);

  const teamPoints = useMemo(() => {
    if (!state) return [];
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
                if (grade) {
                    if (item.gradePointsOverride && item.gradePointsOverride[grade.id] !== undefined) pointsWon += item.gradePointsOverride[grade.id];
                    else pointsWon += grade.points;
                }
            }
            
            if (tPoints[participant.teamId] !== undefined) {
                tPoints[participant.teamId] += pointsWon;
            }
        });
    });
    
    return teams
        .map(team => ({ ...team, points: tPoints[team.id] || 0 }))
        .sort((a, b) => b.points - a.points);
  }, [state?.teams, state?.results, state?.items, state?.participants, state?.gradePoints]);
  
  const upcomingEvents = useMemo(() => {
    if (!state) return [];
    const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const [time, modifier] = timeStr.split(' ');
        if (!time || !modifier) return 0;
        let [hours, minutes] = time.split(':').map(Number);
        if (hours === 12) {
            hours = modifier.toUpperCase() === 'AM' ? 0 : 12;
        } else if (modifier.toUpperCase() === 'PM') {
            hours += 12;
        }
        return hours * 100 + (minutes || 0);
    };
    
    return [...state.schedule]
      .filter(s => hasJudgeAccess(s.itemId))
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        
        const timeA = parseTime(a.time.split(' - ')[0]);
        const timeB = parseTime(b.time.split(' - ')[0]);
        return timeA - timeB;
      })
      .slice(0, 5);
  }, [state?.schedule, hasJudgeAccess]);
  
  const recentResult = useMemo(() => {
    if (!state) return null;
    const validDeclaredResults = state.results.filter(r => r.status === ResultStatus.DECLARED && state.items.some(i => i.id === r.itemId) && hasJudgeAccess(r.itemId));
    const lastDeclared = validDeclaredResults.pop(); 
    if (!lastDeclared) return null;
    const item = state.items.find(i => i.id === lastDeclared.itemId);
    const category = state.categories.find(c => c.id === lastDeclared.categoryId);
    if (!item || !category) return null;
    const winners = lastDeclared.winners
      .filter(w => w.position > 0 || w.gradeId) 
      .sort((a, b) => {
          if (a.position > 0 && b.position > 0) return a.position - b.position;
          if (a.position > 0) return -1;
          if (b.position > 0) return 1;
          return (b.mark || 0) - (a.mark || 0);
      })
      .slice(0, 10) 
      .map(winner => {
        const participant = state.participants.find(p => p.id === winner.participantId);
        const team = participant ? state.teams.find(t => t.id === participant.teamId) : null;
        let pointsWon = 0;
        if (winner.position === 1) pointsWon += item.points.first;
        else if (winner.position === 2) pointsWon += item.points.second;
        else if (winner.position === 3) pointsWon += item.points.third;
        const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
        const grade = winner.gradeId ? gradeConfig.find(g => g.id === winner.gradeId) : null;
        if (grade) {
            if (item.gradePointsOverride && item.gradePointsOverride[grade.id] !== undefined) pointsWon += item.gradePointsOverride[grade.id];
            else pointsWon += grade.points;
        }
        const participantName = item.type === ItemType.GROUP && participant ? `${participant.name} & Party` : (participant?.name || 'N/A');
        return { ...winner, participantName, place: participant?.place, teamName: team?.name || 'N/A', totalPoints: pointsWon, gradeName: grade?.name || '-' };
      });
    return { itemName: item.name, categoryName: category.name, winners };
  }, [state?.results, state?.items, state?.categories, state?.participants, state?.teams, state?.gradePoints, hasJudgeAccess]);

  const stats = {
    participants: state?.participants.length || 0,
    teams: state?.teams.length || 0,
    items: state?.items.length || 0,
    scheduled: state?.schedule.length || 0,
    resultsDeclared: state?.results.filter(r => r.status === ResultStatus.DECLARED && state.items.some(i => i.id === r.itemId) && hasJudgeAccess(r.itemId)).length || 0
  };
  
  const topScore = teamPoints[0]?.points || 0;
  const leadTeam = teamPoints[0]?.name || '---';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
       
       <div className="relative w-full rounded-[2.5rem] bg-[#E8E4D5] dark:bg-[#1A1F1B] border border-amazio-primary/10 shadow-2xl overflow-hidden group transition-all duration-700">
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amazio-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-amazio-primary/10 transition-colors duration-700"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-8 gap-6">
              
              <div className="lg:col-span-7 flex flex-col items-start gap-3">
                  <div className="flex items-center gap-2.5 px-3 py-1 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-full border border-amazio-primary/10 dark:border-white/10 shadow-sm">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     <span className="text-[9px] font-black tracking-[0.2em] uppercase text-amazio-primary/80 dark:text-zinc-400">System Active</span>
                  </div>

                  <div className="space-y-1">
                      <p className="text-amazio-secondary dark:text-amazio-accent text-xs font-bold tracking-[0.3em] uppercase opacity-70">
                        {state?.settings.organizingTeam || "The Rooted Tree"}
                      </p>
                      
                      <div className="py-1">
                          {state?.settings.branding?.typographyUrl ? (
                              <img 
                                  src={state.settings.branding.typographyUrl} 
                                  alt={state.settings.heading} 
                                  className="h-auto max-h-24 sm:max-h-28 w-auto object-contain filter drop-shadow-xl hover:scale-[1.02] transition-transform duration-500 origin-left" 
                              />
                          ) : (
                              <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tighter leading-tight text-amazio-primary dark:text-white uppercase">
                                {state?.settings.heading || 'AMAZIO'}
                              </h1>
                          )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-500 font-bold italic tracking-wide max-w-lg">
                            "{state?.settings.description || "Knowledge Fest, to the Wisdom"}"
                        </p>
                      </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                     <button 
                        onClick={() => setActiveTab(TABS.SCHEDULE)} 
                        className="group flex items-center gap-2 px-6 py-3 bg-amazio-primary dark:bg-amazio-secondary text-white font-black rounded-xl shadow-xl hover:bg-amazio-secondary dark:hover:bg-amazio-primary hover:scale-[1.05] active:scale-0.98 transition-all duration-300 text-xs uppercase tracking-widest"
                     >
                        View Schedule
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     
                     <button 
                        onClick={() => setActiveTab(TABS.PROJECTOR)} 
                        className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl hover:bg-indigo-700 hover:scale-[1.05] active:scale-0.98 transition-all duration-300 text-xs uppercase tracking-widest"
                     >
                        Live Projector
                        <Monitor size={16} />
                     </button>

                     <button 
                        onClick={() => setActiveTab(TABS.POINTS)} 
                        className="group hidden sm:flex items-center gap-2 px-5 py-3 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-amazio-primary/10 dark:border-white/10 text-amazio-primary dark:text-zinc-300 font-bold rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 text-xs uppercase tracking-widest"
                     >
                        Leaderboard
                        <ExternalLink size={14} />
                     </button>
                  </div>
              </div>

              <div className="lg:col-span-5 flex flex-row lg:flex-row justify-center lg:justify-end items-center gap-6">
                  
                  <div className="hidden sm:flex flex-col items-end text-right gap-1 animate-in fade-in slide-in-from-right-4 duration-700">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-xl border border-yellow-500/20 shadow-sm">
                         <Crown size={14} className="text-yellow-600 dark:text-yellow-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-500">Current Lead</span>
                      </div>
                      <p className="text-xl font-black text-amazio-primary dark:text-white uppercase tracking-tight truncate max-w-[160px]">{leadTeam}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{topScore} Points Won</p>
                  </div>

                  <div className="h-20 w-px bg-amazio-primary/10 dark:bg-white/10 hidden sm:block"></div>

                  <div className="relative group cursor-default">
                      <div className="absolute inset-0 bg-amazio-primary/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-1000"></div>
                      
                      <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-amazio-primary/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center transition-all duration-500 group-hover:border-amazio-primary/30 group-hover:scale-105">
                          
                          <div className="absolute inset-1.5 rounded-full border border-dashed border-amazio-primary/10 animate-[spin_25s_linear_infinite] opacity-40"></div>
                          
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-1">Total Items</p>
                          <p className="text-5xl font-black text-amazio-primary dark:text-white leading-none tracking-tighter drop-shadow-sm">
                            {stats.items}
                          </p>
                          
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amazio-secondary text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                             <Activity size={16} />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} title="Participants" value={stats.participants} onClick={() => setActiveTab(TABS.DATA_ENTRY)} delay={100} />
          <StatCard icon={Flag} title="Teams" value={stats.teams} onClick={() => setActiveTab(TABS.TEAMS_CATEGORIES)} delay={200} />
          <StatCard icon={ClipboardList} title="Items" value={stats.items} onClick={() => setActiveTab(TABS.ITEMS)} delay={300} />
          <StatCard icon={Calendar} title="Events" value={stats.scheduled} onClick={() => setActiveTab(TABS.SCHEDULE)} delay={400} />
          <StatCard icon={Trophy} title="Declared" value={stats.resultsDeclared} onClick={() => setActiveTab(TABS.SCORING_RESULTS)} delay={500} />
          <StatCard icon={TrendingUp} title="Top Score" value={topScore} onClick={() => setActiveTab(TABS.POINTS)} delay={600} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <Card title="Team Standings">
                <div className="space-y-1">
                    {teamPoints.length > 0 ? (
                        teamPoints.map((team, index) => {
                            const progress = topScore > 0 ? (team.points / topScore) * 100 : 0;
                            const isWinner = index === 0 && team.points > 0;
                            return (
                                <div key={team.id} className="group relative p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center justify-between mb-2 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm border ${isWinner ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-black/5 dark:border-white/5'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <span className={`font-bold block ${isWinner ? 'text-amazio-primary dark:text-white text-lg' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                    {team.name}
                                                </span>
                                            </div>
                                            {isWinner && <Crown className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-xl text-amazio-primary dark:text-white block leading-none">{team.points}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Points</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-black/5 dark:bg-black/40 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out ${isWinner ? 'bg-yellow-500 text-yellow-500' : 'bg-amazio-secondary dark:bg-amazio-accent text-amazio-secondary dark:text-amazio-accent'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl">
                             <p className="text-zinc-500 font-medium">No points calculated yet.</p>
                        </div>
                    )}
                </div>
              </Card>

              <Card title="Upcoming Events">
                {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingEvents.map((event, i) => {
                            const item = state?.items.find(i => i.id === event.itemId);
                            const category = state?.categories.find(c => c.id === event.categoryId);
                            return (
                                <div key={event.id} className="flex items-center gap-5 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-amazio-primary/5 dark:border-white/5 hover:border-amazio-secondary/30 dark:hover:border-amazio-accent/30 hover:bg-white/60 dark:hover:bg-white/10 transition-all group">
                                    <div className="flex-shrink-0 w-16 h-16 bg-white/50 dark:bg-black/40 rounded-xl flex flex-col items-center justify-center border border-amazio-primary/10 dark:border-white/5 group-hover:border-amazio-secondary/50 dark:group-hover:border-amazio-accent/50 transition-colors shadow-inner">
                                        <span className="text-[10px] font-bold uppercase text-zinc-500 group-hover:text-amazio-secondary dark:group-hover:text-amazio-accent">{event.date.split(' ')[0].substring(0,3)}</span>
                                        <span className="text-2xl font-black text-amazio-primary dark:text-white leading-none">{event.date.split(' ')[1] || '0'+(i+1)}</span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-amazio-primary dark:text-white text-lg truncate pr-4">{item?.name}</h4>
                                            <span className="px-2 py-0.5 bg-amazio-secondary/10 dark:bg-amazio-secondary/20 text-amazio-secondary dark:text-amazio-neon rounded text-[10px] font-bold uppercase tracking-wider border border-amazio-secondary/20 dark:border-amazio-secondary/30">{event.stage}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            <span className="flex items-center gap-1.5"><ClipboardList size={14} className="text-amazio-secondary dark:text-amazio-accent"/> {category?.name}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-amazio-secondary dark:text-amazio-accent"/> {event.time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Calendar className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-700 mb-3" />
                        <p className="text-zinc-500">No events scheduled.</p>
                    </div>
                )}
              </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
               <Card title="Latest Result" className="min-h-[400px]">
                {recentResult ? (
                  <div className="relative h-full flex flex-col">
                    <div className="text-center mb-8 relative z-10">
                      <span className="inline-block px-3 py-1 bg-amazio-secondary dark:bg-amazio-accent text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-sm dark:shadow-neon">
                        {recentResult.categoryName}
                      </span>
                      <h3 className="text-3xl font-black text-amazio-primary dark:text-white leading-tight mb-2 drop-shadow-sm dark:drop-shadow-lg">{recentResult.itemName}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Official Results</p>
                    </div>
                    
                    <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                        {recentResult.winners.map((winner) => {
                            const pos = winner.position;
                            const isRanked = pos > 0 && pos <= 3;
                            const colorClass = pos === 1 ? 'bg-yellow-100 text-yellow-700' : pos === 2 ? 'bg-slate-100 text-slate-700' : pos === 3 ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-500';

                            return (
                                <div key={`${winner.participantId}-${winner.totalPoints}`} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isRanked ? 'bg-white dark:bg-white/[0.03] border-amazio-primary/10' : 'bg-white/40 dark:bg-white/5 border-transparent'}`}>
                                    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center font-bold text-sm border border-black/5`}>
                                        {pos || '-'}
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                            {winner.participantName} {winner.place && <span className="opacity-50 font-medium text-[0.8em]">, {winner.place}</span>}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-zinc-500 uppercase">{winner.teamName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right px-2">
                                         <span className="block text-lg font-bold text-amazio-primary dark:text-white leading-none">+{winner.totalPoints}</span>
                                         <span className="text-[8px] font-bold text-zinc-400 uppercase">Pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-8">
                         <button onClick={() => setActiveTab(TABS.SCORING_RESULTS)} className="w-full py-4 rounded-xl bg-moss-gradient text-white text-sm font-bold shadow-lg dark:shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            All Results <Award size={16}/>
                        </button>
                    </div>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-20 h-20 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-black/5 dark:border-white/10 animate-pulse">
                             <Sparkles className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                        </div>
                        <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Awaiting Results</h4>
                        <p className="text-xs text-zinc-500 mt-2 px-8">Winners will be highlighted here in real-time once declared.</p>
                    </div>
                )}
              </Card>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;