import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { Item, ItemType } from '../../types';

const ItemsManagement: React.FC = () => {
    const { state, dispatch } = useAppState();
    
    const initialItemState: Omit<Item, 'id'> = {
        name: '',
        categoryId: '',
        type: ItemType.SINGLE,
        points: { first: 5, second: 3, third: 1 },
        maxParticipants: 1,
    };
    const [itemFormData, setItemFormData] = useState<Omit<Item, 'id'>>(initialItemState);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
    const thClasses = "px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider";
    const tdClasses = "px-4 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300";

    const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'type') {
            const maxParticipants = value === ItemType.GROUP ? state.settings.defaultParticipantsPerItem : 1;
            setItemFormData(prev => ({ ...prev, [name]: value, maxParticipants }));
        } else {
            setItemFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItemFormData(prev => ({
            ...prev,
            points: { ...prev.points, [name]: +value }
        }));
    };

    const resetItemForm = () => {
        setItemFormData(initialItemState);
        setEditingItemId(null);
    };

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemFormData.name || !itemFormData.categoryId) return;

        if (editingItemId) {
            dispatch({ type: 'UPDATE_ITEM', payload: { ...itemFormData, id: editingItemId } });
        } else {
            dispatch({ type: 'ADD_ITEM', payload: { ...itemFormData, id: `item${Date.now()}` } });
        }
        resetItemForm();
    };

    const handleEditItem = (item: Item) => {
        setEditingItemId(item.id);
        setItemFormData(item);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm("Are you sure you want to delete this item? This may affect existing participants.")) {
            dispatch({ type: 'DELETE_ITEM', payload: id });
        }
    };

    return (
        <Card title="Items Management">
            <form onSubmit={handleItemSubmit} className="space-y-4 mb-6 border-b dark:border-zinc-700 pb-6">
                <h4 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{editingItemId ? 'Edit Item' : 'Add New Item'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Item Name</label>
                        <input type="text" name="name" value={itemFormData.name} onChange={handleItemFormChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select name="categoryId" value={itemFormData.categoryId} onChange={handleItemFormChange} className={inputClasses} required>
                            <option value="">Select Category</option>
                            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Item Type</label>
                        <select name="type" value={itemFormData.type} onChange={handleItemFormChange} className={inputClasses}>
                            <option value={ItemType.SINGLE}>Single</option>
                            <option value={ItemType.GROUP}>Group</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium">Points</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <input type="number" name="first" value={itemFormData.points.first} onChange={handleItemPointsChange} placeholder="1st" className={inputClasses} />
                            <input type="number" name="second" value={itemFormData.points.second} onChange={handleItemPointsChange} placeholder="2nd" className={inputClasses} />
                            <input type="number" name="third" value={itemFormData.points.third} onChange={handleItemPointsChange} placeholder="3rd" className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Max Participants</label>
                        <input type="number" name="maxParticipants" value={itemFormData.maxParticipants} onChange={handleItemFormChange} className={inputClasses} />
                    </div>
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">{editingItemId ? 'Update Item' : 'Add Item'}</button>
                    {editingItemId && <button type="button" onClick={resetItemForm} className="px-4 py-2 bg-zinc-500 text-white rounded-md hover:bg-zinc-600">Cancel</button>}
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                            <th className={thClasses}>Name</th>
                            <th className={thClasses}>Category</th>
                            <th className={thClasses}>Type</th>
                            <th className={thClasses}>Points (1/2/3)</th>
                            <th className={thClasses}>Participants</th>
                            <th className={thClasses}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                        {state.items.map(item => (
                            <tr key={item.id}>
                                <td className={`${tdClasses} font-medium text-zinc-900 dark:text-zinc-100`}>{item.name}</td>
                                <td className={tdClasses}>{state.categories.find(c => c.id === item.categoryId)?.name}</td>
                                <td className={tdClasses}>{item.type}</td>
                                <td className={tdClasses}>{`${item.points.first}/${item.points.second}/${item.points.third}`}</td>
                                <td className={`${tdClasses} text-center`}>{item.maxParticipants}</td>
                                <td className={`${tdClasses} space-x-2 whitespace-nowrap`}>
                                    <button onClick={() => handleEditItem(item)} className="text-teal-600 hover:text-teal-800 dark:hover:text-teal-400 text-sm font-medium">Edit</button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ItemsManagement;
