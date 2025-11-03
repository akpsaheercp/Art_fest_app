import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { Judge } from '../../types';
import { Trash2, GripVertical, X } from 'lucide-react';

interface ListItem {
    id: string;
    name: string;
}

interface ManagementListProps<T extends ListItem> {
    title: string;
    items: T[];
    onAdd: (name: string) => void;
    onUpdate: (item: T) => void;
    onReorder: (items: T[]) => void;
    onDeleteMultiple: (ids: string[]) => void;
}

const ManagementList = <T extends ListItem>({ title, items, onAdd, onUpdate, onReorder, onDeleteMultiple }: ManagementListProps<T>) => {
    const [newItemName, setNewItemName] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const handleAdd = () => {
        if (newItemName.trim()) {
            onAdd(newItemName.trim());
            setNewItemName('');
        }
    };

    const handleSelect = (id: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelected(new Set(items.map(i => i.id)));
        else setSelected(new Set());
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Delete ${selected.size} selected item(s)?`)) {
            onDeleteMultiple(Array.from(selected));
            setSelected(new Set());
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragEnd = () => setDraggedId(null);
    const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;
        const currentItems = [...items];
        const draggedIndex = currentItems.findIndex(item => item.id === draggedId);
        const targetIndex = currentItems.findIndex(item => item.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);
        onReorder(currentItems);
        setDraggedId(null);
    };

    const inputClasses = "flex-grow block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const editableInputClasses = "w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -mx-1";

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={`New ${title.slice(0, -1)} name`} className={inputClasses} />
                <button onClick={handleAdd} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Add</button>
            </div>
            
            {selected.size > 0 && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-md flex justify-between items-center">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{selected.size} item(s) selected.</p>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
            
            <ul className="space-y-2">
                 <li className="flex items-center p-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <input type="checkbox" className="h-4 w-4 mr-3 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" onChange={handleSelectAll} checked={selected.size > 0 && selected.size === items.length} />
                    <span>Name</span>
                 </li>
                {items.map(item => (
                    <li
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDrop={(e) => handleDrop(e, item.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={handleDragEnd}
                        className={`flex justify-between items-center p-2 rounded-md transition-all duration-200 ${selected.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-zinc-100 dark:bg-zinc-800/50'} ${draggedId === item.id ? 'opacity-30' : ''}`}
                    >
                        <div className="flex items-center gap-2 flex-grow">
                            <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" checked={selected.has(item.id)} onChange={() => handleSelect(item.id)} />
                            <GripVertical className="h-5 w-5 text-zinc-400 cursor-move" aria-label="Drag to reorder" />
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => onUpdate({ ...item, name: e.target.value })}
                                className={editableInputClasses}
                                aria-label="Item name"
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const JudgeAssignments = () => {
    const { state, dispatch } = useAppState();
    const { items, categories, schedule, judges, judgeAssignments } = state;
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    const availableItems = useMemo(() => {
        return items.filter(i => i.categoryId === selectedCategoryId);
    }, [items, selectedCategoryId]);

    const currentAssignment = useMemo(() => {
        if (!selectedItemId || !selectedCategoryId) return null;
        return judgeAssignments.find(a => a.itemId === selectedItemId && a.categoryId === selectedCategoryId);
    }, [judgeAssignments, selectedItemId, selectedCategoryId]);
    
    const assignedJudgeIds = useMemo(() => currentAssignment?.judgeIds || [], [currentAssignment]);

    const assignedJudges = useMemo(() => 
        assignedJudgeIds.map(id => judges.find(j => j.id === id)).filter(Boolean) as Judge[], 
        [assignedJudgeIds, judges]
    );

    const availableJudges = useMemo(() => 
        judges.filter(j => !assignedJudgeIds.includes(j.id)),
        [judges, assignedJudgeIds]
    );

    const scheduledEvent = useMemo(() => {
        if (!selectedItemId || !selectedCategoryId) return null;
        return schedule.find(e => e.itemId === selectedItemId && e.categoryId === selectedCategoryId);
    }, [schedule, selectedItemId, selectedCategoryId]);

    const handleAddJudge = (judgeId: string) => {
        if (!judgeId || !selectedItemId || !selectedCategoryId) return;
        const newJudgeIds = [...assignedJudgeIds, judgeId];
        dispatch({ type: 'UPDATE_ITEM_JUDGES', payload: { itemId: selectedItemId, categoryId: selectedCategoryId, judgeIds: newJudgeIds }});
    };
    
    const handleRemoveJudge = (judgeId: string) => {
        if (!selectedItemId || !selectedCategoryId) return;
        const newJudgeIds = assignedJudgeIds.filter(id => id !== judgeId);
        dispatch({ type: 'UPDATE_ITEM_JUDGES', payload: { itemId: selectedItemId, categoryId: selectedCategoryId, judgeIds: newJudgeIds }});
    };
    
    const inputClasses = "block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    return (
        <Card title="Assign Judges to Items">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select value={selectedCategoryId} onChange={e => { setSelectedCategoryId(e.target.value); setSelectedItemId(''); }} className={`mt-1 ${inputClasses}`}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                    {scheduledEvent && (
                        <div className="mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                             <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Schedule Information</h4>
                             <p className="text-xs text-zinc-500 dark:text-zinc-400">{scheduledEvent.date} at {scheduledEvent.time} on {scheduledEvent.stage}</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Assigned Judges</label>
                        {assignedJudges.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {assignedJudges.map(judge => (
                                    <span key={judge.id} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm px-2 py-1 rounded-full">
                                        {judge.name}
                                        <button onClick={() => handleRemoveJudge(judge.id)} className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100 rounded-full"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        ) : <p className="text-xs text-zinc-500 dark:text-zinc-400">No judges assigned yet.</p>}
                    </div>
                     {availableJudges.length > 0 && (
                        <div className="mt-3">
                            <select onChange={(e) => handleAddJudge(e.target.value)} value="" className={`${inputClasses} text-sm`}>
                                <option value="" disabled>+ Assign a judge...</option>
                                {availableJudges.map(judge => (
                                    <option key={judge.id} value={judge.id}>{judge.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};


const JudgesManagement: React.FC = () => {
    const { state, dispatch } = useAppState();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Judges & Assignments</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Manage Judges List">
                        <ManagementList
                            title="Judges"
                            items={state.judges}
                            onAdd={(name) => dispatch({ type: 'ADD_JUDGE', payload: { id: `judge${Date.now()}`, name } })}
                            onUpdate={(judge) => dispatch({ type: 'UPDATE_JUDGE', payload: judge as Judge })}
                            onReorder={(judges) => dispatch({ type: 'REORDER_JUDGES', payload: judges as Judge[] })}
                            onDeleteMultiple={(ids) => dispatch({ type: 'DELETE_MULTIPLE_JUDGES', payload: ids })}
                        />
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <JudgeAssignments />
                </div>
            </div>
        </div>
    );
};

export default JudgesManagement;