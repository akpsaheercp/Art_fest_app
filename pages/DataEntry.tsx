import React, { useState, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { Participant } from '../types';
import { Plus, X, ArrowUpDown, Trash2, Upload, FileDown, CheckCircle, XCircle } from 'lucide-react';

// --- Import CSV Modal Component ---
interface ImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useAppState();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ validParticipants: Participant[]; errors: string[] }>({ validParticipants: [], errors: [] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setStatus({ validParticipants: [], errors: [] });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = 'chestNumber,name,teamName,categoryName';
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "participants_template.csv");
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
        setStatus({ validParticipants: [], errors: [] });

        const text = await selectedFile.text();
        const lines = text.trim().split(/\r?\n/);
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim());

        const requiredHeaders = ['chestNumber', 'name', 'teamName', 'categoryName'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            setStatus({ validParticipants: [], errors: [`Import failed. Missing required columns: ${missingHeaders.join(', ')}`] });
            setIsProcessing(false);
            return;
        }

        const newParticipants: Participant[] = [];
        const errors: string[] = [];
        const existingChestNumbers = new Set(state.participants.map(p => p.chestNumber));

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const values = line.split(',').map(v => v.trim());
            const rowData: { [key: string]: string } = {};
            headers.forEach((header, index) => { rowData[header] = values[index] || ''; });

            const { chestNumber, name, teamName, categoryName } = rowData;
            
            if (!chestNumber || !name || !teamName || !categoryName) {
                errors.push(`Row ${i + 1}: Missing one or more required fields.`);
                continue;
            }
            if (existingChestNumbers.has(chestNumber)) {
                errors.push(`Row ${i + 1}: Chest number "${chestNumber}" already exists in the system or this file.`);
                continue;
            }
            const team = state.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
            if (!team) {
                errors.push(`Row ${i + 1}: Team "${teamName}" not found.`);
                continue;
            }
            const category = state.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (!category) {
                errors.push(`Row ${i + 1}: Category "${categoryName}" not found.`);
                continue;
            }

            newParticipants.push({ id: `p${Date.now()}${i}`, chestNumber, name, teamId: team.id, categoryId: category.id, itemIds: [] });
            existingChestNumbers.add(chestNumber);
        }
        
        setStatus({ validParticipants: newParticipants, errors });
        setIsProcessing(false);
    };

    const handleConfirmImport = () => {
        if (status.validParticipants.length > 0) {
            dispatch({ type: 'ADD_MULTIPLE_PARTICIPANTS', payload: status.validParticipants });
            alert(`${status.validParticipants.length} participant(s) imported successfully!`);
            handleClose();
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4" onClick={handleClose} aria-modal="true" role="dialog">
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold">Import Participants from CSV</h3>
                    <button onClick={handleClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close modal"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200">Instructions</h4>
                        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
                            <li>Your CSV file must contain the headers: <code className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded text-xs">chestNumber,name,teamName,categoryName</code></li>
                            <li>Team and Category names must match existing entries in the system.</li>
                            <li>Chest numbers must be unique.</li>
                        </ul>
                        <button onClick={handleDownloadTemplate} className="mt-2 flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                            <FileDown className="h-4 w-4" /> Download Template
                        </button>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="csv-upload" className="block text-sm font-medium mb-1">Upload File</label>
                        <div className="flex items-center gap-2">
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">
                                Choose File
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} id="csv-upload" className="hidden" accept=".csv" />
                            {file && <span className="text-sm text-zinc-600 dark:text-zinc-400">{file.name}</span>}
                        </div>
                    </div>

                    {(isProcessing || status.validParticipants.length > 0 || status.errors.length > 0) && (
                         <div className="mt-4 p-4 rounded-md bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                             <h4 className="font-medium text-zinc-800 dark:text-zinc-200">Import Preview</h4>
                             {isProcessing && <p className="text-sm text-zinc-600 dark:text-zinc-400">Processing file...</p>}
                             {!isProcessing && status.validParticipants.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Found <strong>{status.validParticipants.length}</strong> valid participant(s) to import.</span>
                                </div>
                             )}
                              {!isProcessing && status.errors.length > 0 && (
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    <div className="flex items-center gap-2 font-medium">
                                        <XCircle className="h-5 w-5" />
                                        <span>Found <strong>{status.errors.length}</strong> error(s) in the file:</span>
                                    </div>
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
                    <button type="button" onClick={handleConfirmImport} disabled={isProcessing || status.validParticipants.length === 0} className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed">
                        {isProcessing ? 'Processing...' : `Confirm Import (${status.validParticipants.length})`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};


// --- Participant Form Modal Component ---
interface ParticipantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingParticipant: Participant | null;
}

const ParticipantFormModal: React.FC<ParticipantFormModalProps> = ({ isOpen, onClose, editingParticipant }) => {
    const { state, dispatch } = useAppState();
    
    const initialFormState: Omit<Participant, 'id'> = {
        chestNumber: '', name: '', teamId: '', categoryId: '', itemIds: []
    };

    const [formData, setFormData] = useState<Omit<Participant, 'id'>>(initialFormState);

    React.useEffect(() => {
        if (editingParticipant) {
            setFormData({
                chestNumber: editingParticipant.chestNumber,
                name: editingParticipant.name,
                teamId: editingParticipant.teamId,
                categoryId: editingParticipant.categoryId,
                itemIds: editingParticipant.itemIds || []
            });
        } else {
            setFormData(initialFormState);
        }
    }, [editingParticipant, isOpen]);
    
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            setFormData({ ...formData, [name]: value, itemIds: [] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleItemCheckboxChange = (itemId: string) => {
        const isSelected = formData.itemIds.includes(itemId);
        let newItemIds = [...formData.itemIds];

        if (isSelected) {
            newItemIds = newItemIds.filter(id => id !== itemId);
        } else {
            if (newItemIds.length < state.settings.maxItemsPerParticipant) {
                newItemIds.push(itemId);
            } else {
                alert(`A participant can be enrolled in a maximum of ${state.settings.maxItemsPerParticipant} items.`);
            }
        }
        setFormData({ ...formData, itemIds: newItemIds });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.teamId || !formData.categoryId || !formData.chestNumber) return;

        const existingParticipantByChest = state.participants.find(p => p.chestNumber === formData.chestNumber);
        if (existingParticipantByChest && existingParticipantByChest.id !== editingParticipant?.id) {
            alert('A participant with this chest number already exists.');
            return;
        }
        
        if (editingParticipant) {
            dispatch({ type: 'UPDATE_PARTICIPANT', payload: { ...formData, id: editingParticipant.id } });
        } else {
            dispatch({ type: 'ADD_PARTICIPANT', payload: { ...formData, id: `p${Date.now()}` } });
        }
        onClose();
    };
    
    const availableItems = state.items.filter(item => item.categoryId === formData.categoryId);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold">{editingParticipant ? 'Edit Participant' : 'Add New Participant'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Close modal"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                            <label className="block text-sm font-medium">Items ({formData.itemIds.length} / {state.settings.maxItemsPerParticipant})</label>
                            <div className="mt-1 p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md h-40 overflow-y-auto space-y-2">
                                {formData.categoryId ? (
                                    availableItems.length > 0 ? (
                                        availableItems.map(item => {
                                            const isChecked = formData.itemIds.includes(item.id);
                                            const isDisabled = !isChecked && formData.itemIds.length >= state.settings.maxItemsPerParticipant;
                                            return (
                                                <div key={item.id} className="flex items-center">
                                                    <input
                                                        id={`item-modal-${item.id}`}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isDisabled}
                                                        onChange={() => handleItemCheckboxChange(item.id)}
                                                        className="h-4 w-4 rounded border-zinc-300 text-teal-500 focus:ring-teal-500 disabled:opacity-50"
                                                    />
                                                    <label
                                                        htmlFor={`item-modal-${item.id}`}
                                                        className={`ml-2 block text-sm ${isDisabled ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-300 cursor-pointer'}`}
                                                    >
                                                        {item.name}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">No items available for this category.</p>
                                    )
                                ) : (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Please select a category first.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">{editingParticipant ? 'Update Participant' : 'Add Participant'}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};


const DataEntryPage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({ searchTerm: '', teamId: '', categoryId: '' });
    const [sort, setSort] = useState<{ key: keyof Participant; dir: 'asc' | 'desc' }>({ key: 'chestNumber', dir: 'asc' });
    
    const filteredAndSortedParticipants = useMemo(() => {
        return state.participants
            .filter(p => {
                const searchMatch = p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || p.chestNumber.includes(filters.searchTerm);
                const teamMatch = filters.teamId ? p.teamId === filters.teamId : true;
                const categoryMatch = filters.categoryId ? p.categoryId === filters.categoryId : true;
                return searchMatch && teamMatch && categoryMatch;
            })
            .sort((a, b) => {
                const valA = a[sort.key];
                const valB = b[sort.key];
                if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
                if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
                return 0;
            });
    }, [state.participants, filters, sort]);

    const handleSort = (key: keyof Participant) => {
        setSort(prev => ({
            key,
            dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const handleSelect = (id: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelected(new Set(filteredAndSortedParticipants.map(p => p.id)));
        } else {
            setSelected(new Set());
        }
    };
    
    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selected.size} participant(s)?`)) {
            dispatch({ type: 'DELETE_MULTIPLE_PARTICIPANTS', payload: Array.from(selected) });
            setSelected(new Set());
        }
    };

    const handleEdit = (participant: Participant) => {
        setEditingParticipant(participant);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingParticipant(null);
        setIsModalOpen(true);
    };

    const inputClasses = "block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
    
    const renderSortIcon = (key: keyof Participant) => (
        <ArrowUpDown size={14} className={`ml-1 inline-block transition-transform ${sort.key === key ? 'text-teal-500' : 'text-zinc-400'} ${sort.key === key && sort.dir === 'desc' ? 'rotate-180' : ''}`} />
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Participants Management</h2>
                 <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">
                        <Upload className="h-4 w-4" />
                        <span>Import CSV</span>
                    </button>
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-sm transition-colors">
                        <Plus className="h-5 w-5" />
                        <span>Add Participant</span>
                    </button>
                </div>
            </div>

            <Card title="Participants List" className="lg:col-span-2">
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-b dark:border-zinc-700">
                    <input type="text" placeholder="Search name or chest no..." value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} className={inputClasses}/>
                    <select value={filters.teamId} onChange={e => setFilters({...filters, teamId: e.target.value})} className={inputClasses}>
                        <option value="">All Teams</option>
                        {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})} className={inputClasses}>
                        <option value="">All Categories</option>
                        {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {selected.size > 0 && (
                    <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-md flex justify-between items-center">
                        <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{selected.size} participant(s) selected.</p>
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
                               <th className="px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-teal-500 focus:ring-teal-500" onChange={handleSelectAll} checked={selected.size > 0 && selected.size === filteredAndSortedParticipants.length} /></th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"><button onClick={() => handleSort('chestNumber')} className="flex items-center">Chest No. {renderSortIcon('chestNumber')}</button></th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"><button onClick={() => handleSort('name')} className="flex items-center">Name {renderSortIcon('name')}</button></th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Team</th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Items</th>
                               <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredAndSortedParticipants.map(p => (
                                <tr key={p.id} className={`${selected.has(p.id) ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                                    <td className="px-4 py-4"><input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-teal-500 focus:ring-teal-500" checked={selected.has(p.id)} onChange={() => handleSelect(p.id)} /></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.chestNumber}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{state.teams.find(t=>t.id === p.teamId)?.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{state.categories.find(c=>c.id === p.categoryId)?.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{p.itemIds.length}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button onClick={() => handleEdit(p)} className="font-medium text-teal-500 hover:text-teal-700 dark:hover:text-teal-400">Edit</button>
                                    </td>
                                </tr>
                            ))}
                       </tbody>
                    </table>
                </div>
            </Card>

             <ParticipantFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingParticipant={editingParticipant}
            />
             <ImportCSVModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </div>
    );
};

export default DataEntryPage;