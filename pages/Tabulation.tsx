import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { TabulationEntry } from '../types';

const TabulationPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    const availableItems = useMemo(() => {
        return state.items.filter(item => item.categoryId === selectedCategoryId);
    }, [selectedCategoryId, state.items]);
    
    const participantsInItem = useMemo(() => {
        if (!selectedItemId) return [];
        return state.participants.filter(p => p.itemIds.includes(selectedItemId));
    }, [selectedItemId, state.participants]);

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

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
  
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Tabulation</h2>
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
                )}
            </Card>
        </div>
    );
};

export default TabulationPage;
