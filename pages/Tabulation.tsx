import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { TabulationEntry, ResultStatus, ItemType, Judge } from '../types';
import { Trophy, ChevronDown, Printer, X } from 'lucide-react';
import ReportViewer from '../components/ReportViewer';


const TabulationPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [isConfirmingDeclare, setIsConfirmingDeclare] = useState(false);
    const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [expandedResult, setExpandedResult] = useState<string | null>(null);
    const [resultFilter, setResultFilter] = useState('');
    const [reportContent, setReportContent] = useState<{ title: string; content: string } | null>(null);

    const availableItems = useMemo(() => {
        return state.items.filter(item => item.categoryId === selectedCategoryId);
    }, [selectedCategoryId, state.items]);
    
    const participantsInItem = useMemo(() => {
        if (!selectedItemId) return [];
        return state.participants.filter(p => p.itemIds.includes(selectedItemId));
    }, [selectedItemId, state.participants]);

    const assignedJudges = useMemo(() => {
        if (!selectedItemId || !selectedCategoryId) return [];
        const assignment = state.judgeAssignments.find(a => a.itemId === selectedItemId && a.categoryId === selectedCategoryId);
        if (!assignment) return [];
        return assignment.judgeIds.map(id => state.judges.find(j => j.id === id)).filter(Boolean) as Judge[];
    }, [selectedItemId, selectedCategoryId, state.judgeAssignments, state.judges]);
    
    const resultForItem = useMemo(() => {
        return state.results.find(r => r.itemId === selectedItemId && r.categoryId === selectedCategoryId);
    }, [state.results, selectedItemId, selectedCategoryId]);

    const currentStatus = resultForItem?.status || ResultStatus.NOT_UPLOADED;
    const isDeclared = currentStatus === ResultStatus.DECLARED;

    useEffect(() => {
        setIsConfirmingDeclare(false);
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    }, [selectedCategoryId, selectedItemId]);
    
    useEffect(() => {
        return () => { if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current); };
    }, []);

    useEffect(() => {
        if (participantsInItem.length > 0 && state.codeLetters.length > 0) {
            participantsInItem.forEach((p, index) => {
                const entryId = `${selectedItemId}-${p.id}`;
                if (!state.tabulation.find(t => t.id === entryId)) {
                    dispatch({ type: 'UPDATE_TABULATION_ENTRY', payload: {
                        id: entryId, itemId: selectedItemId, categoryId: selectedCategoryId, participantId: p.id,
                        codeLetter: state.codeLetters[index % state.codeLetters.length].code,
                        marks: {}, finalMark: null, position: null, gradeId: null,
                    }});
                }
            });
        }
    }, [participantsInItem, selectedItemId, selectedCategoryId, state.codeLetters, state.tabulation, dispatch]);

    const handleTabulationChange = (participantId: string, field: 'codeLetter' | 'mark', value: string | number, judgeId?: string) => {
        const entryId = `${selectedItemId}-${participantId}`;
        const existingEntry = state.tabulation.find(t => t.id === entryId);
        if (existingEntry) {
            if (field === 'mark' && judgeId) {
                const newMarks = { ...existingEntry.marks, [judgeId]: value === '' ? null : +value };
                dispatch({ type: 'UPDATE_TABULATION_ENTRY', payload: { ...existingEntry, marks: newMarks } });
            } else if (field === 'codeLetter') {
                dispatch({ type: 'UPDATE_TABULATION_ENTRY', payload: { ...existingEntry, codeLetter: String(value) } });
            }
        }
    };

    const handleSaveAsUploaded = () => {
      if (!selectedItemId || !selectedCategoryId) return;
      dispatch({ type: 'UPDATE_RESULT_STATUS', payload: { itemId: selectedItemId, categoryId: selectedCategoryId, status: ResultStatus.UPLOADED }});
    };

    const handleReopenForEdits = () => {
      if (!selectedItemId || !selectedCategoryId) return;
      dispatch({ type: 'UPDATE_RESULT_STATUS', payload: { itemId: selectedItemId, categoryId: selectedCategoryId, status: ResultStatus.UPLOADED }});
    };
    
    const handleDeclareResult = () => {
        if (!selectedItemId || !selectedCategoryId) return;
        if (isConfirmingDeclare) {
            dispatch({ type: 'DECLARE_RESULT', payload: { itemId: selectedItemId, categoryId: selectedCategoryId } });
            setIsConfirmingDeclare(false);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        } else {
            setIsConfirmingDeclare(true);
            confirmTimeoutRef.current = setTimeout(() => setIsConfirmingDeclare(false), 3000);
        }
    };
    
    const getParticipant = (id: string) => state.participants.find(p => p.id === id);
    const getTeamName = (id: string) => state.teams.find(t => t.id === getParticipant(id)?.teamId)?.name || 'N/A';
    const getGradeName = (id: string | null, itemType: 'single' | 'group') => {
        if (!id) return '-';
        return state.gradePoints[itemType].find(g => g.id === id)?.name || 'N/A';
    };

    const handleToggleExpand = (resultKey: string) => {
        setExpandedResult(prev => (prev === resultKey ? null : resultKey));
    };

    const filteredDeclaredResults = useMemo(() => {
        return state.results.filter(r => {
            if (r.status !== ResultStatus.DECLARED) return false;
            const item = state.items.find(i => i.id === r.itemId);
            if (!item) return false;
            const category = state.categories.find(c => c.id === r.categoryId);
            const searchTerm = resultFilter.toLowerCase();
            return item.name.toLowerCase().includes(searchTerm) || category?.name.toLowerCase().includes(searchTerm);
        });
    }, [state.results, state.items, state.categories, resultFilter]);

    const handleGenerateReport = () => {
        const styles = `<style>table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}th,td{border:1px solid #ddd;padding:8px;text-align:left}thead{background-color:#f2f2f2}h3{font-size:1.25rem;margin-top:2rem;margin-bottom:0.5rem}.page-break{page-break-before:always}</style>`;
        let html = styles;
        
        filteredDeclaredResults.forEach((result, index) => {
            const item = state.items.find(i => i.id === result.itemId)!;
            const category = state.categories.find(c => c.id === result.categoryId)!;
            const participants = state.tabulation
                .filter(t => t.itemId === result.itemId && t.categoryId === result.categoryId)
                .sort((a,b) => (b.finalMark ?? -1) - (a.finalMark ?? -1));

            html += `<div class="${index > 0 ? 'page-break' : ''}"><h3>${item.name} (${category.name})</h3><table><thead><tr><th>Rank</th><th>Chest No</th><th>Name</th><th>Team</th><th>Mark</th><th>Grade</th><th>Position</th></tr></thead><tbody>`;
            let rank = 0, lastMark = -1;
            participants.forEach((p, pIndex) => {
                if(p.finalMark !== lastMark) rank = pIndex + 1;
                lastMark = p.finalMark!;
                const participant = getParticipant(p.participantId)!;
                html += `<tr><td>${rank}</td><td>${participant.chestNumber}</td><td>${participant.name}</td><td>${getTeamName(p.participantId)}</td><td>${p.finalMark?.toFixed(2)}</td><td>${getGradeName(p.gradeId, item.type.toLowerCase() as 'single'|'group')}</td><td>${p.position || '-'}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        });
        setReportContent({ title: 'Declared Results Summary', content: html });
    };

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800/50 disabled:cursor-not-allowed";
  
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Tabulation & Results</h2>
            <Card title="Mark & Code Letter Entry">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select value={selectedCategoryId} onChange={e => { setSelectedCategoryId(e.target.value); setSelectedItemId(''); }} className={`mt-1 ${inputClasses}`}>
                            <option value="">Select Category</option>
                            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Item</label>
                        <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className={`mt-1 ${inputClasses}`} disabled={!selectedCategoryId}>
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
                                        {assignedJudges.map(judge => (
                                            <th key={judge.id} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mark ({judge.name})</th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Final Mark</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {participantsInItem.map(p => {
                                        const entry = state.tabulation.find(t => t.participantId === p.id && t.itemId === selectedItemId);
                                        return (
                                            <tr key={p.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.chestNumber}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><input type="text" value={entry?.codeLetter || ''} onChange={(e) => handleTabulationChange(p.id, 'codeLetter', e.target.value)} className={`${inputClasses} max-w-[100px]`} disabled={isDeclared} /></td>
                                                {assignedJudges.map(judge => (
                                                    <td key={judge.id} className="px-4 py-4 whitespace-nowrap text-sm">
                                                        <input type="number" value={entry?.marks?.[judge.id] ?? ''} onChange={(e) => handleTabulationChange(p.id, 'mark', e.target.value, judge.id)} className={`${inputClasses} max-w-[100px]`} disabled={isDeclared} />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">{entry?.finalMark?.toFixed(2) || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-end items-center gap-4">
                            <div className="text-sm mr-auto">Current Status: <span className={`font-bold px-3 py-1 rounded-full text-xs ${isDeclared ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : currentStatus === ResultStatus.UPLOADED ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>{currentStatus}</span></div>
                            {isDeclared ? (<button onClick={handleReopenForEdits} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors">Modify Result</button>) : (
                                <>
                                    <button onClick={handleSaveAsUploaded} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors">
                                        {currentStatus === ResultStatus.UPLOADED ? 'Update Marks' : 'Save Marks'}
                                    </button>
                                    <button onClick={handleDeclareResult} className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${isConfirmingDeclare ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{isConfirmingDeclare ? 'Confirm Declare?' : 'Declare Result'}</button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </Card>

            <Card title="Declared Results">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <input type="text" placeholder="Filter results by item or category..." value={resultFilter} onChange={e => setResultFilter(e.target.value)} className={`${inputClasses} flex-grow`}/>
                    <button onClick={handleGenerateReport} disabled={filteredDeclaredResults.length === 0} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed">
                        <Printer className="h-4 w-4"/> Print Filtered
                    </button>
                </div>
                <div className="space-y-2">
                    {filteredDeclaredResults.length === 0 && <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No declared results match your filter.</p>}
                    {filteredDeclaredResults.map(result => {
                        const item = state.items.find(i => i.id === result.itemId);
                        if (!item) return null;
                        const resultKey = `${result.itemId}-${result.categoryId}`;
                        const isExpanded = expandedResult === resultKey;
                        const allParticipantsInItem = state.tabulation.filter(t => t.itemId === result.itemId && t.categoryId === result.categoryId).sort((a,b) => (b.finalMark ?? -1) - (a.finalMark ?? -1));
                        
                        let rank = 0;
                        let lastMark = -1;

                        return (
                            <div key={resultKey} className="rounded-lg bg-zinc-100 dark:bg-zinc-800/50 transition-all duration-300">
                                <button onClick={() => handleToggleExpand(resultKey)} className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
                                    <h4 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">{item.name} ({state.categories.find(c=>c.id === result.categoryId)?.name})</h4>
                                    <ChevronDown className={`h-6 w-6 text-zinc-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isExpanded && (
                                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400 uppercase"><tr>
                                                <th className="p-2">Rank</th><th className="p-2">Chest No</th><th className="p-2">Name</th><th className="p-2">Team</th><th className="p-2">Mark</th><th className="p-2">Grade</th><th className="p-2">Position</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {allParticipantsInItem.map((p, index) => {
                                                    if(p.finalMark !== lastMark) rank = index + 1;
                                                    lastMark = p.finalMark!;
                                                    const participant = getParticipant(p.participantId)!;
                                                    return (
                                                        <tr key={p.id}>
                                                            <td className="p-2 font-medium">{p.finalMark !== null ? rank : '-'}</td>
                                                            <td className="p-2">{participant.chestNumber}</td>
                                                            <td className="p-2 font-semibold text-zinc-800 dark:text-zinc-100">{participant.name}</td>
                                                            <td className="p-2">{getTeamName(p.participantId)}</td>
                                                            <td className="p-2 font-bold text-indigo-600 dark:text-indigo-400">{p.finalMark?.toFixed(2)}</td>
                                                            <td className="p-2">{getGradeName(p.gradeId, item.type.toLowerCase() as 'single' | 'group')}</td>
                                                            <td className="p-2">{p.position ? <Trophy className={`w-4 h-4 inline-block ${p.position === 1 ? 'text-yellow-500' : p.position === 2 ? 'text-zinc-400' : 'text-yellow-700'}`} /> : '-' } {p.position || ''}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <ReportViewer 
                isOpen={!!reportContent}
                onClose={() => setReportContent(null)}
                title={reportContent?.title || ''}
                content={reportContent?.content || ''}
            />
        </div>
    );
};

export default TabulationPage;