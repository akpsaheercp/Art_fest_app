import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';

const TeamsAndCategories: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [newCategory, setNewCategory] = useState('');
    const [newTeam, setNewTeam] = useState('');
    const inputClasses = "flex-grow block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            dispatch({ type: 'ADD_CATEGORY', payload: { id: `cat${Date.now()}`, name: newCategory.trim() } });
            setNewCategory('');
        }
    };
    
    const handleAddTeam = () => {
        if (newTeam.trim()) {
            dispatch({ type: 'ADD_TEAM', payload: { id: `team${Date.now()}`, name: newTeam.trim() } });
            setNewTeam('');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Contesting Teams">
                <div className="flex gap-2 mb-4">
                    <input type="text" value={newTeam} onChange={e => setNewTeam(e.target.value)} placeholder="New team name" className={inputClasses} />
                    <button onClick={handleAddTeam} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Add</button>
                </div>
                <ul className="space-y-2">
                    {state.teams.map(team => <li key={team.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md">{team.name} <button onClick={() => dispatch({type: 'DELETE_TEAM', payload: team.id})} className="text-red-500 hover:text-red-700 text-xs">Remove</button></li>)}
                </ul>
            </Card>
            <Card title="Categories">
                <div className="flex gap-2 mb-4">
                    <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className={inputClasses} />
                    <button onClick={handleAddCategory} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Add</button>
                </div>
                <ul className="space-y-2">
                     {state.categories.map(cat => <li key={cat.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md">{cat.name} <button onClick={() => dispatch({type: 'DELETE_CATEGORY', payload: cat.id})} className="text-red-500 hover:text-red-700 text-xs">Remove</button></li>)}
                </ul>
            </Card>
        </div>
    );
};

export default TeamsAndCategories;
