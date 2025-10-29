import React, { useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Trophy } from 'lucide-react';
import { ItemType } from '../types';

const PointsPage: React.FC = () => {
    const { state } = useAppState();

    const { teamPoints, categoryWisePoints, individualPoints } = useMemo(() => {
        // Initialize structures
        const tPoints: { [key: string]: number } = {};
        state.teams.forEach(t => tPoints[t.id] = 0);

        const cPoints: { [key: string]: { [key: string]: number } } = {};
        state.teams.forEach(t => {
            cPoints[t.id] = {};
            state.categories.forEach(c => cPoints[t.id][c.id] = 0);
        });

        const iPoints: { [key: string]: number } = {};
        state.participants.forEach(p => iPoints[p.id] = 0);

        // Process results
        state.results.forEach(result => {
            if (!result.declared) return;

            const item = state.items.find(i => i.id === result.itemId);
            if (!item) return;

            result.winners.forEach(winner => {
                const participant = state.participants.find(p => p.id === winner.participantId);
                if (!participant) return;

                let pointsWon = 0;

                // Position points
                if (winner.position === 1) pointsWon += item.points.first;
                else if (winner.position === 2) pointsWon += item.points.second;
                else if (winner.position === 3) pointsWon += item.points.third;

                // Grade points
                if (winner.gradeId) {
                    const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
                    const grade = gradeConfig.find(g => g.id === winner.gradeId);
                    if (grade) {
                        pointsWon += grade.points;
                    }
                }
                
                // Aggregate points
                if (tPoints[participant.teamId] !== undefined) {
                    tPoints[participant.teamId] += pointsWon;
                }
                if (cPoints[participant.teamId]?.[result.categoryId] !== undefined) {
                    cPoints[participant.teamId][result.categoryId] += pointsWon;
                }
                if (iPoints[participant.id] !== undefined) {
                    iPoints[participant.id] += pointsWon;
                }
            });
        });

        return { teamPoints: tPoints, categoryWisePoints: cPoints, individualPoints: iPoints };
    }, [state.results, state.items, state.participants, state.teams, state.gradePoints, state.categories]);

    // Sorting for display
    const sortedTeams = useMemo(() => {
        return [...state.teams].sort((a, b) => (teamPoints[b.id] || 0) - (teamPoints[a.id] || 0));
    }, [state.teams, teamPoints]);

    const sortedIndividuals = useMemo(() => {
        return [...state.participants]
            .map(p => ({ ...p, points: individualPoints[p.id] || 0 }))
            .filter(p => p.points > 0)
            .sort((a, b) => b.points - a.points)
            .slice(0, 10); // Top 10
    }, [state.participants, individualPoints]);
    
    const getTeamName = (id: string) => state.teams.find(t => t.id === id)?.name || 'N/A';

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Points Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Team Points">
                   {sortedTeams.length > 0 ? (
                       <ul className="space-y-2">
                            {sortedTeams.map((team, index) => (
                                <li key={team.id} className={`flex justify-between items-center p-2 rounded-md ${index === 0 ? 'bg-teal-100 dark:bg-teal-900/50' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                    <div className="flex items-center">
                                        {index === 0 && <Trophy className="w-5 h-5 mr-2 text-yellow-500" />}
                                        <span className="font-medium">{team.name}</span>
                                    </div>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">{teamPoints[team.id]} Pts</span>
                                </li>
                            ))}
                       </ul>
                   ) : (
                       <p className="text-sm text-zinc-500 dark:text-zinc-400">No points recorded yet.</p>
                   )}
                </Card>

                 <Card title="Category Wise Team Points">
                    {state.categories.length > 0 ? (
                        <div className="space-y-4">
                            {state.categories.map(category => (
                                <div key={category.id}>
                                    <h4 className="font-semibold mb-2 text-zinc-700 dark:text-zinc-300">{category.name}</h4>
                                    <ul className="space-y-1 text-sm">
                                        {state.teams.map(team => {
                                            const points = categoryWisePoints[team.id]?.[category.id] || 0;
                                            if (points > 0) {
                                                return (
                                                    <li key={`${team.id}-${category.id}`} className="flex justify-between items-center p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded">
                                                        <span>{team.name}</span>
                                                        <span className="font-semibold">{points} Pts</span>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No categories found.</p>
                    )}
                </Card>

                 <Card title="Top Individual Performers">
                     {sortedIndividuals.length > 0 ? (
                        <ul className="space-y-2">
                            {sortedIndividuals.map((p, index) => (
                                <li key={p.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm">
                                    <div className="flex items-center">
                                        <span className="font-bold mr-2">{index + 1}.</span>
                                        <div>
                                            <div className="font-medium">{p.name}</div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{getTeamName(p.teamId)}</div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">{p.points} Pts</span>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No individual points recorded yet.</p>
                     )}
                </Card>
            </div>
        </div>
    );
};

export default PointsPage;
