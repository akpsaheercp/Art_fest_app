import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Trophy } from 'lucide-react';

const ResultsPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const thClasses = "px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider";
    const tdClasses = "px-4 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300";

    const availableItems = useMemo(() => {
        return state.items.filter(item => item.categoryId === selectedCategoryId);
    }, [selectedCategoryId, state.items]);

    const tabulatedEntries = useMemo(() => {
        if (!selectedItemId) return [];
        return state.tabulation.filter(t => t.itemId === selectedItemId && t.categoryId === selectedCategoryId);
    }, [selectedItemId, selectedCategoryId, state.tabulation]);

    const handleDeclareResult = () => {
        if (!selectedItemId || !selectedCategoryId) return;
        if(window.confirm("Are you sure you want to declare the result for this item? This will finalize positions and grades.")) {
            dispatch({ type: 'DECLARE_RESULT', payload: { itemId: selectedItemId, categoryId: selectedCategoryId } });
        }
    };
    
    const getParticipantName = (id: string) => state.participants.find(p => p.id === id)?.name || 'N/A';
    const getTeamName = (id: string) => {
        const p = state.participants.find(p => p.id === id);
        return p ? state.teams.find(t => t.id === p.teamId)?.name : 'N/A';
    };
    const getGradeName = (id: string | null, itemType: 'single' | 'group') => {
        if (!id) return '-';
        const gradeList = state.gradePoints[itemType];
        return gradeList.find(g => g.id === id)?.name || 'N/A';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Results</h2>
            
            <Card title="Declare Results">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            value={selectedCategoryId}
                            onChange={e => { setSelectedCategoryId(e.target.value); setSelectedItemId(''); }}
                            className={inputClasses}
                        >
                            <option value="">Select Category</option>
                            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Item</label>
                        <select
                            value={selectedItemId}
                            onChange={e => setSelectedItemId(e.target.value)}
                            className={inputClasses}
                            disabled={!selectedCategoryId}
                        >
                            <option value="">Select Item</option>
                            {availableItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                </div>

                {selectedItemId && (
                    <>
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className={thClasses}>Name</th>
                                        <th className={thClasses}>Team</th>
                                        <th className={thClasses}>Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {tabulatedEntries.map(entry => (
                                        <tr key={entry.id}>
                                            <td className={`${tdClasses} font-medium text-zinc-900 dark:text-zinc-100`}>{getParticipantName(entry.participantId)}</td>
                                            <td className={tdClasses}>{getTeamName(entry.participantId)}</td>
                                            {/* FIX: Corrected property access from `entry.mark` to `entry.finalMark` as `mark` does not exist on `TabulationEntry`. */}
                                            <td className={tdClasses}>{entry.finalMark ?? 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleDeclareResult} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Declare Result
                        </button>
                    </>
                )}
            </Card>

            <Card title="Declared Results">
                <div className="space-y-4">
                    {state.results.length === 0 && <p className="text-center text-zinc-500 dark:text-zinc-400">No results have been declared yet.</p>}
                    {state.results.map(result => {
                        const item = state.items.find(i => i.id === result.itemId);
                        if (!item) return null;
                        return (
                            <div key={`${result.itemId}-${result.categoryId}`} className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                                <h4 className="font-semibold text-lg">{item.name} ({state.categories.find(c=>c.id === result.categoryId)?.name})</h4>
                                <ul className="mt-2 space-y-1">
                                    {result.winners.sort((a,b) => a.position - b.position).map(winner => (
                                        <li key={winner.participantId} className="flex items-center justify-between text-sm p-2 rounded-md bg-white dark:bg-zinc-900">
                                            <div className="flex items-center">
                                                <Trophy className={`w-5 h-5 mr-2 ${winner.position === 1 ? 'text-yellow-500' : winner.position === 2 ? 'text-zinc-400' : 'text-yellow-700'}`} />
                                                <div>
                                                   <span className="font-medium">{getParticipantName(winner.participantId)}</span>
                                                   <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">({getTeamName(winner.participantId)})</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                               <span className="font-semibold text-indigo-500">Grade: {getGradeName(winner.gradeId, item.type.toLowerCase() as 'single' | 'group')}</span>
                                               <span className="font-bold">{winner.mark} pts</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ResultsPage;