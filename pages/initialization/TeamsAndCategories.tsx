import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { Trash2, GripVertical } from 'lucide-react';

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
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-4">{title}</h3>
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

const TeamsAndCategories: React.FC = () => {
    const { state, dispatch } = useAppState();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Teams & Categories</h2>
            <Card title="Manage Teams and Categories">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ManagementList
                        title="Teams"
                        items={state.teams}
                        onAdd={(name) => dispatch({ type: 'ADD_TEAM', payload: { id: `team${Date.now()}`, name } })}
                        onUpdate={(team) => dispatch({ type: 'UPDATE_TEAM', payload: team })}
                        onReorder={(teams) => dispatch({ type: 'REORDER_TEAMS', payload: teams })}
                        onDeleteMultiple={(ids) => dispatch({ type: 'DELETE_MULTIPLE_TEAMS', payload: ids })}
                    />
                     <ManagementList
                        title="Categories"
                        items={state.categories}
                        onAdd={(name) => dispatch({ type: 'ADD_CATEGORY', payload: { id: `cat${Date.now()}`, name } })}
                        onUpdate={(cat) => dispatch({ type: 'UPDATE_CATEGORY', payload: cat })}
                        onReorder={(cats) => dispatch({ type: 'REORDER_CATEGORIES', payload: cats })}
                        onDeleteMultiple={(ids) => dispatch({ type: 'DELETE_MULTIPLE_CATEGORIES', payload: ids })}
                    />
                </div>
            </Card>
        </div>
    );
};

export default TeamsAndCategories;