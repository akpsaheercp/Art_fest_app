import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { Item, ItemType } from '../../types';
import { Trash2, Upload, X, FileDown, CheckCircle, XCircle } from 'lucide-react';

// --- Import Items CSV Modal Component ---
interface ImportItemsCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportItemsCSVModal: React.FC<ImportItemsCSVModalProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppState();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ validItems: Item[]; errors: string[] }>({ validItems: [], errors: [] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setStatus({ validItems: [], errors: [] });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = 'name,categoryName,type,pointsFirst,pointsSecond,pointsThird,maxParticipants';
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "items_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);
        setStatus({ validItems: [], errors: [] });

        const text = await selectedFile.text();
        const lines = text.trim().split(/\r?\n/);
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim());

        const requiredHeaders = ['name', 'categoryName', 'type', 'pointsFirst', 'pointsSecond', 'pointsThird', 'maxParticipants'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            setStatus({ validItems: [], errors: [`Missing required columns: ${missingHeaders.join(', ')}`] });
            setIsProcessing(false); return;
        }

        const newItems: Item[] = [];
        const errors: string[] = [];
        const existingItemNames = new Set(state.items.map(i => i.name.toLowerCase()));

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const values = line.split(',').map(v => v.trim());
            const rowData: { [key: string]: string } = {};
            headers.forEach((header, index) => { rowData[header] = values[index] || ''; });

            const { name, categoryName, type, pointsFirst, pointsSecond, pointsThird, maxParticipants } = rowData;
            
            if (!name || !categoryName || !type || !pointsFirst || !pointsSecond || !pointsThird || !maxParticipants) {
                errors.push(`Row ${i + 1}: Missing one or more required fields.`); continue;
            }
            if (existingItemNames.has(name.toLowerCase())) {
                errors.push(`Row ${i + 1}: Item name "${name}" already exists.`); continue;
            }
            const category = state.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (!category) {
                errors.push(`Row ${i + 1}: Category "${categoryName}" not found.`); continue;
            }
            const itemType = type.toLowerCase() === 'group' ? ItemType.GROUP : ItemType.SINGLE;
            
            const points = { first: +pointsFirst, second: +pointsSecond, third: +pointsThird };
            if (isNaN(points.first) || isNaN(points.second) || isNaN(points.third) || isNaN(+maxParticipants)) {
                errors.push(`Row ${i + 1}: Points and Max Participants must be numbers.`); continue;
            }

            newItems.push({ id: `item${Date.now()}${i}`, name, categoryId: category.id, type: itemType, points, maxParticipants: +maxParticipants });
            existingItemNames.add(name.toLowerCase());
        }
        
        setStatus({ validItems: newItems, errors });
        setIsProcessing(false);
    };

    const handleConfirmImport = () => {
        if (status.validItems.length > 0) {
            dispatch({ type: 'ADD_MULTIPLE_ITEMS', payload: status.validItems });
            alert(`${status.validItems.length} item(s) imported successfully!`);
            handleClose();
        }
    };
    
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4" onClick={handleClose}>
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold">Import Items from CSV</h3>
                    <button onClick={handleClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200">Instructions</h4>
                        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
                            <li>Your CSV must contain headers: <code className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded text-xs">name,categoryName,type,pointsFirst,pointsSecond,pointsThird,maxParticipants</code></li>
                            <li><code className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded text-xs">categoryName</code> must match an existing category.</li>
                            <li><code className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded text-xs">type</code> must be either 'Single' or 'Group'.</li>
                        </ul>
                        <button onClick={handleDownloadTemplate} className="mt-2 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                            <FileDown className="h-4 w-4" /> Download Template
                        </button>
                    </div>
                    <div>
                        <label htmlFor="csv-upload" className="block text-sm font-medium mb-1">Upload File</label>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">Choose File</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} id="csv-upload" className="hidden" accept=".csv" />
                            {file && <span className="text-sm text-zinc-600 dark:text-zinc-400">{file.name}</span>}
                        </div>
                    </div>
                    {(isProcessing || status.validItems.length > 0 || status.errors.length > 0) && (
                         <div className="mt-4 p-4 rounded-md bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                             <h4 className="font-medium text-zinc-800 dark:text-zinc-200">Import Preview</h4>
                             {isProcessing && <p className="text-sm text-zinc-600 dark:text-zinc-400">Processing...</p>}
                             {!isProcessing && status.validItems.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Found <strong>{status.validItems.length}</strong> valid item(s) to import.</span>
                                </div>
                             )}
                              {!isProcessing && status.errors.length > 0 && (
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    <div className="flex items-center gap-2 font-medium"><XCircle className="h-5 w-5" /><span>Found <strong>{status.errors.length}</strong> error(s):</span></div>
                                    <ul className="list-disc list-inside mt-2 ml-2 max-h-32 overflow-y-auto text-xs">
                                        {status.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                                        {status.errors.length > 10 && <li>...and {status.errors.length - 10} more.</li>}
                                    </ul>
                                </div>
                             )}
                         </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
                    <button type="button" onClick={handleClose} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Close</button>
                    <button type="button" onClick={handleConfirmImport} disabled={isProcessing || status.validItems.length === 0} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed">
                        {`Confirm Import (${status.validItems.length})`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};


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
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const thClasses = "px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider";
    const tdClasses = "px-4 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300";

    const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'type') {
            const maxParticipants = value === ItemType.GROUP ? state.settings.defaultParticipantsPerItem : 1;
            setItemFormData(prev => ({ ...prev, type: value as ItemType, maxParticipants }));
        } else if (name === 'maxParticipants') {
            setItemFormData(prev => ({ ...prev, maxParticipants: +value }));
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

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedItems(new Set(state.items.map(i => i.id)));
        else setSelectedItems(new Set());
    };
    
    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
            dispatch({ type: 'DELETE_MULTIPLE_ITEMS', payload: Array.from(selectedItems) });
            setSelectedItems(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Items Management</h2>
            <Card title="Manage Competition Items">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">
                        <Upload className="h-4 w-4" />
                        <span>Import from CSV</span>
                    </button>
                </div>
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
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">{editingItemId ? 'Update Item' : 'Add Item'}</button>
                        {editingItemId && <button type="button" onClick={resetItemForm} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Cancel</button>}
                    </div>
                </form>

                {selectedItems.size > 0 && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md flex justify-between items-center">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{selectedItems.size} item(s) selected.</p>
                        <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm transition-colors">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Selected</span>
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className={thClasses}><input type="checkbox" onChange={handleSelectAll} checked={selectedItems.size > 0 && selectedItems.size === state.items.length} className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" /></th>
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
                                <tr key={item.id} className={`${selectedItems.has(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                    <td className={tdClasses}><input type="checkbox" onChange={() => handleSelectItem(item.id)} checked={selectedItems.has(item.id)} className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500" /></td>
                                    <td className={`${tdClasses} font-medium text-zinc-900 dark:text-zinc-100`}>{item.name}</td>
                                    <td className={tdClasses}>{state.categories.find(c => c.id === item.categoryId)?.name}</td>
                                    <td className={tdClasses}>{item.type}</td>
                                    <td className={tdClasses}>{`${item.points.first}/${item.points.second}/${item.points.third}`}</td>
                                    <td className={`${tdClasses} text-center`}>{item.maxParticipants}</td>
                                    <td className={`${tdClasses} space-x-2 whitespace-nowrap`}>
                                        <button onClick={() => handleEditItem(item)} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ImportItemsCSVModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};

export default ItemsManagement;