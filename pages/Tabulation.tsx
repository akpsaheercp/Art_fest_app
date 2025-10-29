import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { TabulationEntry } from '../types';
import { Trophy } from 'lucide-react';

const TabulationPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [isConfirmingDeclare, setIsConfirmingDeclare] = useState(false);
    const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const availableItems = useMemo(() => {
        return state.items.filter(item => item.categoryId === selectedCategoryId);
    }, [selectedCategoryId, state.items]);
    
    const participantsInItem = useMemo(() => {
        if (!selectedItemId) return [];
        return state.participants.filter(p => p.itemIds.includes(selectedItemId));
    }, [selectedItemId, state.participants]);

    useEffect(() => {
        // When category/item changes, reset confirmation state
        setIsConfirmingDeclare(false);
        if (confirmTimeoutRef.current) {
            clearTimeout(confirmTimeoutRef.current);
        }
    }, [selectedCategoryId, selectedItemId]);
    
    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // When participants for an item are loaded, ensure tabulation entries exist
        if (participantsInItem.length > 0 && state.codeLetters.length > 0) {
            participantsInItem.forEach((p, index) => {
                const entryId = `${selectedItemId}-${p.id}`;
                const existingEntry = state.tabulation.find(t => t.id === entryId);
                if (!existingEntry) {
                    const newEntry: TabulationEntry = {
                        id: entryId,
                        itemId: selectedItemId,
                        categoryId: selectedCategoryId,
                        participantId: p.id,
                        codeLetter: state.codeLetters[index % state.codeLetters.length].code,
                        mark: null,
                        position: null,
                        gradeId: null,
                    };
                    dispatch({ type: 'UPDATE_TABULATION_ENTRY', payload: newEntry });
                }
            });
        }
    }, [participantsInItem, selectedItemId, selectedCategoryId, state.codeLetters, state.tabulation, dispatch]);

    const handleTabulationChange = (participantId: string, field: 'codeLetter' | 'mark', value: string | number) => {
        const entryId = `${selectedItemId}-${participantId}`;
        const existingEntry = state.tabulation.find(t => t.id === entryId);
        if (existingEntry) {
            const updatedEntry = { ...existingEntry, [field]: value };
            dispatch({ type: 'UPDATE_TABULATION_ENTRY', payload: updatedEntry });
        }
    };
    
    const handleDeclareResult = () => {
        if (!selectedItemId || !selectedCategoryId) return;

        if (isConfirmingDeclare) {
            dispatch({ type: 'DECLARE_RESULT', payload: { itemId: selectedItemId, categoryId: selectedCategoryId } });
            setIsConfirmingDeclare(false);
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
            }
        } else {
            setIsConfirmingDeclare(true);
            confirmTimeoutRef.current = setTimeout(() => {
                setIsConfirmingDeclare(false);
            }, 3000); // Reset after 3 seconds
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

    const resultForItem = useMemo(() => {
        return state.results.find(r => r.itemId === selectedItemId && r.categoryId === selectedCategoryId);
    }, [state.results, selectedItemId, selectedCategoryId]);

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
  
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Tabulation & Results</h2>
            <Card title="Mark & Code Letter Entry">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            value={selectedCategoryId}
                            onChange={e => {
                                setSelectedCategoryId(e.target.value);
                                setSelectedItemId('');
                            }}
                            className={`mt-1 ${inputClasses}`}
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
                            className={`mt-1 ${inputClasses}`}
                            disabled={!selectedCategoryId}
                        >
                            <option value="">Select Item</option>
                            {availableItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                </div>

                {selectedItemId && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Chest No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Code Letter</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {participantsInItem.map(p => {
                                        const entry = state.tabulation.find(t => t.participantId === p.id && t.itemId === selectedItemId);
                                        return (
                                            <tr key={p.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.chestNumber}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <input
                                                        type="text"
                                                        value={entry?.codeLetter || ''}
                                                        onChange={(e) => handleTabulationChange(p.id, 'codeLetter', e.target.value)}
                                                        className={`${inputClasses} max-w-[100px]`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <input
                                                        type="number"
                                                        value={entry?.mark ?? ''}
                                                        onChange={(e) => handleTabulationChange(p.id, 'mark', +e.target.value)}
                                                        className={`${inputClasses} max-w-[100px]`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleDeclareResult} 
                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                                    isConfirmingDeclare 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-teal-600 hover:bg-teal-700'
                                } disabled:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={!!resultForItem?.declared}
                            >
                                {resultForItem?.declared ? 'Result Declared' : isConfirmingDeclare ? 'Confirm Declare?' : 'Declare Result'}
                            </button>
                        </div>
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
                                               <span className="font-semibold text-teal-500">Grade: {getGradeName(winner.gradeId, item.type.toLowerCase() as 'single' | 'group')}</span>
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

export default TabulationPage;
