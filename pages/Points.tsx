import React from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';

const PointsPage: React.FC = () => {
    const { state } = useAppState();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Points Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Team Points">
                   <ul className="space-y-2">
                        {state.teams.map(team => (
                            <li key={team.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                <span className="font-medium">{team.name}</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400">0 Pts</span>
                            </li>
                        ))}
                   </ul>
                </Card>
                 <Card title="Category Wise Team Points">
                     <p className="text-sm text-zinc-500 dark:text-zinc-400">Point calculation pending implementation.</p>
                </Card>
                 <Card title="Individual Points">
                     <p className="text-sm text-zinc-500 dark:text-zinc-400">Point calculation pending implementation.</p>
                </Card>
            </div>
        </div>
    );
};

export default PointsPage;
