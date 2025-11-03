
import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { GripVertical } from 'lucide-react';

const CodeLetters: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [newCode, setNewCode] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const inputClasses = "flex-grow block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const editableInputClasses = "w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -mx-1";

    const handleAddCodeLetter = () => {
        if (newCode.trim()) {
            dispatch({ type: 'ADD_CODE_LETTER', payload: { id: `cl${Date.now()}`, code: newCode.trim() } });
            setNewCode('');
        }
    };

    const handleUpdateCode = (id: string, code: string) => {
        dispatch({ type: 'UPDATE_CODE_LETTER', payload: { id, code } });
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const currentItems = [...state.codeLetters];
        const draggedIndex = currentItems.findIndex(item => item.id === draggedId);
        const targetIndex = currentItems.findIndex(item => item.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);
        
        dispatch({ type: 'REORDER_CODE_LETTERS', payload: currentItems });
        setDraggedId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Code Letters</h2>
            <Card title="Sample Code Letters">
                <div className="max-w-md mx-auto">
                    <div className="flex gap-2 mb-4">
                        <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="New code" className={inputClasses} />
                        <button onClick={handleAddCodeLetter} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                    <ul className="space-y-2">
                        {state.codeLetters.map(c => (
                            <li 
                                key={c.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, c.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, c.id)}
                                onDragEnd={handleDragEnd}
                                onDragEnter={() => setDragOverId(c.id)}
                                onDragLeave={() => setDragOverId(null)}
                                className={`flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md transition-all duration-200
                                    ${draggedId === c.id ? 'opacity-50' : ''}
                                    ${dragOverId === c.id && draggedId !== c.id ? 'border-t-2 border-indigo-500' : ''}
                                `}
                            >
                                <div className="flex items-center gap-2 flex-grow">
                                    <GripVertical className="h-5 w-5 text-zinc-400 cursor-move" aria-label="Drag to reorder" />
                                    <input 
                                        type="text"
                                        value={c.code}
                                        onChange={(e) => handleUpdateCode(c.id, e.target.value)}
                                        className={editableInputClasses}
                                        aria-label="Code letter"
                                    />
                                </div>
                                <button onClick={() => dispatch({type: 'DELETE_CODE_LETTER', payload: c.id})} className="text-red-500 hover:text-red-700 text-xs ml-2">Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default CodeLetters;