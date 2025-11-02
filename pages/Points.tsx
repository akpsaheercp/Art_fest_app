import React, { useMemo, useState, useCallback } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Trophy, ArrowUpDown } from 'lucide-react';
import { ItemType } from '../types';

const PointsPage: React.FC = () => {
    const { state } = useAppState();

    const [filters, setFilters] = useState({ teamId: '', categoryId: '' });
    const [teamSort, setTeamSort] = useState<{ key: 'name' | 'points'; dir: 'asc' | 'desc' }>({ key: 'points', dir: 'desc' });
    const [individualSort, setIndividualSort] = useState<{ key: 'name' | 'teamName' | 'points'; dir: 'asc' | 'desc' }>({ key: 'points', dir: 'desc' });

    const { teamPoints, categoryWisePoints, individualPoints } = useMemo(() => {
        const tPoints: { [key: string]: number } = {};
        state.teams.forEach(t => tPoints[t.id] = 0);

        const cPoints: { [key: string]: { [key: string]: number } } = {};
        state.teams.forEach(t => {
            cPoints[t.id] = {};
            state.categories.forEach(c => cPoints[t.id][c.id] = 0);
        });

        const iPoints: { [key: string]: number } = {};
        state.participants.forEach(p => iPoints[p.id] = 0);

        state.results.forEach(result => {
            if (!result.declared) return;
            const item = state.items.find(i => i.id === result.itemId);
            if (!item) return;

            result.winners.forEach(winner => {
                const participant = state.participants.find(p => p.id === winner.participantId);
                if (!participant) return;

                let pointsWon = 0;
                if (winner.position === 1) pointsWon += item.points.first;
                else if (winner.position === 2) pointsWon += item.points.second;
                else if (winner.position === 3) pointsWon += item.points.third;

                if (winner.gradeId) {
                    const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
                    const grade = gradeConfig.find(g => g.id === winner.gradeId);
                    if (grade) pointsWon += grade.points;
                }
                
                if (tPoints[participant.teamId] !== undefined) tPoints[participant.teamId] += pointsWon;
                if (cPoints[participant.teamId]?.[result.categoryId] !== undefined) cPoints[participant.teamId][result.categoryId] += pointsWon;
                if (iPoints[participant.id] !== undefined) iPoints[participant.id] += pointsWon;
            });
        });

        return { teamPoints, categoryWisePoints, individualPoints };
    }, [state.teams, state.categories, state.participants, state.results, state.items, state.gradePoints]);

    const getTeamName = useCallback(
        (id: string) => state.teams.find(t => t.id === id)?.name || 'N/A',
        [state.teams]
    );

    const sortedTeams = useMemo(() => {
        return [...state.teams]
            .map(team => ({ ...team, points: teamPoints[team.id] || 0 }))
            .sort((a, b) => {
                const valA = teamSort.key === 'name' ? a.name : a.points;
                const valB = teamSort.key === 'name' ? b.name : b.points;
                if (valA < valB) return teamSort.dir === 'asc' ? -1 : 1;
                if (valA > valB) return teamSort.dir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [state.teams, teamPoints, teamSort]);

    const filteredAndSortedIndividuals = useMemo(() => {
        return [...state.participants]
            .map(p => ({ ...p, points: individualPoints[p.id] || 0, teamName: getTeamName(p.teamId) }))
            .filter(p => p.points > 0)
            .filter(p => filters.teamId ? p.teamId === filters.teamId : true)
            .filter(p => filters.categoryId ? p.categoryId === filters.categoryId : true)
            .sort((a, b) => {
                const key = individualSort.key;
                const direction = individualSort.dir === 'asc' ? 1 : -1;

                const valueA = a[key];
                const valueB = b[key];

                if (key === 'points') {
                    const numA = Number(valueA) || 0;
                    const numB = Number(valueB) || 0;
                    if (numA < numB) return -1 * direction;
                    if (numA > numB) return 1 * direction;
                    return 0;
                }
                
                const stringA = String(valueA || '');
                const stringB = String(valueB || '');
                return stringA.localeCompare(stringB) * direction;
            });
    }, [state.participants, individualPoints, filters, individualSort, getTeamName]);

    const handleTeamSort = (key: 'name' | 'points') => {
        setTeamSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    };

    const handleIndividualSort = (key: 'name' | 'teamName' | 'points') => {
        setIndividualSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    };
    
    const renderSortIcon = (currentSort: { key: string, dir: string }, sortKey: string) => (
        <ArrowUpDown size={14} className={`ml-1 inline-block transition-transform ${currentSort.key === sortKey ? 'text-teal-500' : 'text-zinc-400'} ${currentSort.key === sortKey && currentSort.dir === 'desc' ? 'rotate-180' : ''}`} />
    );

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Points Summary</h2>
            
            <Card title="Filter & Find">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Filter by Team</label>
                        <select value={filters.teamId} onChange={e => setFilters({...filters, teamId: e.target.value})} className={inputClasses}>
                            <option value="">All Teams</option>
                            {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Filter by Category</label>
                        <select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})} className={inputClasses}>
                            <option value="">All Categories</option>
                            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Total Team Points">
                   <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-zinc-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        <button onClick={() => handleTeamSort('name')} className="flex items-center">Team {renderSortIcon(teamSort, 'name')}</button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        <button onClick={() => handleTeamSort('points')} className="flex items-center">Points {renderSortIcon(teamSort, 'points')}</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map((team, index) => (
                                    <tr key={team.id} className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            <div className="flex items-center">
                                                {teamSort.key === 'points' && teamSort.dir === 'desc' && index === 0 && <Trophy className="w-5 h-5 mr-2 text-yellow-500" />}
                                                {team.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-teal-600 dark:text-teal-400">{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                   </div>
                </Card>

                 <Card title="Category Wise Team Points">
                    {state.categories.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {state.categories.map(category => {
                                const sortedTeamsForCategory = state.teams
                                    .map(team => ({ name: team.name, points: categoryWisePoints[team.id]?.[category.id] || 0 }))
                                    .filter(t => t.points > 0)
                                    .sort((a,b) => b.points - a.points);
                                
                                if (sortedTeamsForCategory.length === 0) return null;

                                return (
                                <div key={category.id}>
                                    <h4 className="font-semibold mb-2 text-zinc-700 dark:text-zinc-300">{category.name}</h4>
                                    <ul className="space-y-1 text-sm">
                                        {sortedTeamsForCategory.map(team => (
                                            <li key={`${team.name}-${category.id}`} className="flex justify-between items-center p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded">
                                                <span>{team.name}</span>
                                                <span className="font-semibold">{team.points} Pts</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No categories found.</p>
                    )}
                </Card>
            </div>
            
            <Card title="Individual Performers">
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-zinc-200 dark:border-zinc-700">
                           <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rank</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    <button onClick={() => handleIndividualSort('name')} className="flex items-center">Performer {renderSortIcon(individualSort, 'name')}</button>
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    <button onClick={() => handleIndividualSort('teamName')} className="flex items-center">Team {renderSortIcon(individualSort, 'teamName')}</button>
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    <button onClick={() => handleIndividualSort('points')} className="flex items-center">Points {renderSortIcon(individualSort, 'points')}</button>
                                </th>
                           </tr>
                        </thead>
                         <tbody>
                            {filteredAndSortedIndividuals.map((p, index) => (
                                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.teamName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-teal-600 dark:text-teal-400">{p.points}</td>
                                </tr>
                            ))}
                       </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PointsPage;