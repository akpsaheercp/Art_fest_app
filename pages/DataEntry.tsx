
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Participant } from '../types';

const DataEntryPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [formData, setFormData] = useState<Omit<Participant, 'id'>>({
        chestNumber: '', name: '', teamId: '', categoryId: '', itemIds: []
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData({ ...formData, itemIds: selectedIds });
    };
    
    const resetForm = () => {
        setFormData({ chestNumber: '', name: '', teamId: '', categoryId: '', itemIds: [] });
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.teamId || !formData.categoryId) return;
        
        if (editingId) {
            dispatch({ type: 'UPDATE_PARTICIPANT', payload: { ...formData, id: editingId } });
        } else {
            dispatch({ type: 'ADD_PARTICIPANT', payload: { ...formData, id: `p${Date.now()}` } });
        }
        resetForm();
    };
    
    const handleEdit = (participant: Participant) => {
        setEditingId(participant.id);
        setFormData(participant);
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure?")) {
            dispatch({type: 'DELETE_PARTICIPANT', payload: id});
        }
    }
    
    const availableItems = state.items.filter(item => item.categoryId === formData.categoryId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Participant's Data Entry</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title={editingId ? 'Edit Participant' : 'Add Participant'} className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Chest Number</label>
                            <input type="text" name="chestNumber" value={formData.chestNumber} onChange={handleInputChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Team</label>
                            <select name="teamId" value={formData.teamId} onChange={handleInputChange} className={inputClasses} required>
                                <option value="">Select Team</option>
                                {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Category</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={inputClasses} required>
                                <option value="">Select Category</option>
                                {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Items</label>
                            <select
                                multiple
                                value={formData.itemIds}
                                onChange={handleItemChange}
                                className={`${inputClasses} h-40`}
                                disabled={!formData.categoryId}
                            >
                                {availableItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Hold Ctrl/Cmd to select multiple.</p>
                        </div>

                        <div className="flex gap-2">
                           <button type="submit" className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">{editingId ? 'Update' : 'Add'}</button>
                           {editingId && <button type="button" onClick={resetForm} className="w-full px-4 py-2 bg-zinc-500 text-white rounded-md hover:bg-zinc-600">Cancel</button>}
                        </div>
                    </form>
                </Card>
                <Card title="Participants List" className="lg:col-span-2">
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                           <thead className="bg-zinc-50 dark:bg-zinc-800">
                               <tr>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Chest No.</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Team</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Items</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {state.participants.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.chestNumber}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{state.teams.find(t=>t.id === p.teamId)?.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{state.categories.find(c=>c.id === p.categoryId)?.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.itemIds.length}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button onClick={() => handleEdit(p)} className="font-medium text-teal-600 hover:text-teal-800 dark:hover:text-teal-400">Edit</button>
                                            <button onClick={() => handleDelete(p.id)} className="font-medium text-red-600 hover:text-red-800 dark:hover:text-red-400">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DataEntryPage;