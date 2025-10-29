import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';

const CodeLetters: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [newCode, setNewCode] = useState('');
    const inputClasses = "flex-grow block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

    const handleAddCodeLetter = () => {
        if (newCode.trim()) {
            dispatch({ type: 'ADD_CODE_LETTER', payload: { id: `cl${Date.now()}`, code: newCode.trim() } });
            setNewCode('');
        }
    };

    return (
        <Card title="Sample Code Letters">
            <div className="max-w-md mx-auto">
                <div className="flex gap-2 mb-4">
                    <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="New code" className={inputClasses} />
                    <button onClick={handleAddCodeLetter} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Add</button>
                </div>
                <ul className="space-y-2">
                    {state.codeLetters.map(c => <li key={c.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md">{c.code} <button onClick={() => dispatch({type: 'DELETE_CODE_LETTER', payload: c.id})} className="text-red-500 hover:text-red-700 text-xs">Remove</button></li>)}
                </ul>
            </div>
        </Card>
    );
};

export default CodeLetters;
