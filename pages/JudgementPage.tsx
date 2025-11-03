import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { ResultStatus, Judge } from '../types';

const JudgementPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    const availableItems = useMemo(() => {
        if (!selectedCategoryId) return [];
        return state.items.filter(item => item.categoryId === selectedCategoryId);
    }, [selectedCategoryId, state.items]);

    const entriesForItem = useMemo(() => {
        if (!selectedItemId || !selectedCategoryId) return [];
        return state.tabulation
            .filter(t => t.itemId === selectedItemId && t.categoryId === selectedCategoryId)
            .sort((a, b) => a.codeLetter.localeCompare(b.codeLetter));
    }, [selectedItemId, selectedCategoryId, state.tabulation]);

    const assignedJudges = useMemo(() => {
        if (!selectedItemId || !selectedCategoryId) return [];
        const assignment = state.judgeAssignments.find(a => a.itemId === selectedItemId && a.categoryId === selectedCategoryId);
        if (!assignment) return [];
        return assignment.judgeIds.map(id => state.judges.find(j => j.id === id)).filter(Boolean) as Judge[];
    }, [selectedItemId, selectedCategoryId, state.judgeAssignments, state.judges]);

    const resultForItem = useMemo(() => {
        return state.results.find(r => r.itemId === selectedItemId && r.categoryId === selectedCategoryId);
    }, [state.results, selectedItemId, selectedCategoryId]);
    
    const isDeclared = resultForItem?.status === ResultStatus.DECLARED;

    const handleMarkChange = (entryId: string, judgeId: string, mark: number | null) => {
        const entry = state.tabulation.find(t => t.id === entryId);
        if (entry) {
            const newMarks = { ...entry.marks, [judgeId]: mark };
            dispatch({
                type: 'UPDATE_TABULATION_ENTRY',
                payload: { ...entry, marks: newMarks }
            });
        }
    };
    
    const handleSaveMarks = () => {
        if (!selectedItemId || !selectedCategoryId) return;
        dispatch({ type: 'UPDATE_RESULT_STATUS', payload: { itemId: selectedItemId, categoryId: selectedCategoryId, status: ResultStatus.UPLOADED }});
        alert('Marks have been saved successfully.');
    };

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800/50 disabled:cursor-not-allowed";

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Judgement Panel</h2>
            <Card title="Select Event for Judging">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select 
                            value={selectedCategoryId} 
                            onChange={e => { setSelectedCategoryId(e.target.value); setSelectedItemId(''); }} 
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
            </Card>

            {selectedItemId && (
                <Card title="Enter Marks">
                    {isDeclared && (
                        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md text-sm">
                            The result for this item has been declared and cannot be modified from this panel.
                        </div>
                    )}
                     {assignedJudges.length === 0 && !isDeclared && (
                        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-sm">
                            No judges have been assigned to this item yet. Please go to 'Judges & Assignments' to add them.
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                             <thead className="bg-zinc-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Code Letter</th>
                                    {assignedJudges.map(judge => (
                                        <th key={judge.id} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mark ({judge.name})</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {entriesForItem.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">{entry.codeLetter}</td>
                                        {assignedJudges.map(judge => (
                                            <td key={judge.id} className="px-4 py-4">
                                                <input 
                                                    type="number"
                                                    value={entry.marks?.[judge.id] ?? ''}
                                                    onChange={e => handleMarkChange(entry.id, judge.id, e.target.value === '' ? null : +e.target.value)}
                                                    className={`${inputClasses} max-w-[120px]`}
                                                    disabled={isDeclared}
                                                    placeholder="Enter mark"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!isDeclared && (
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleSaveMarks} 
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                                disabled={entriesForItem.length === 0 || assignedJudges.length === 0}
                            >
                                Save All Marks
                            </button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default JudgementPage;