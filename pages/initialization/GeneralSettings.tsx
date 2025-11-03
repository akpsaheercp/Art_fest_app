import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { HelpCircle, X, Shield, Users, Trash2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { TABS } from '../../constants';

// --- Tooltip Component ---
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute left-1/2 -top-2 -translate-y-full -translate-x-1/2 w-48 p-2 text-xs text-white bg-zinc-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
        <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-700 -translate-x-1/2"></div>
    </div>
);

// --- User Form Modal Component ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: User | null;
    currentUser: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, editingUser, currentUser }) => {
    const { state, dispatch } = useAppState();
    const initialFormState: Omit<User, 'id'> = { username: '', password: '', role: UserRole.TEAM_LEADER, teamId: '' };
    const [formData, setFormData] = useState(initialFormState);

    React.useEffect(() => {
        if (editingUser) {
            setFormData({ ...editingUser, password: '' });
        } else {
            setFormData(initialFormState);
        }
    }, [editingUser, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { username, password, role } = formData;
        if (!username || (!editingUser && !password) || !role) {
            alert("Please fill all required fields.");
            return;
        }

        const payload: User = { ...formData, id: editingUser ? editingUser.id : `user_${Date.now()}` };
        if (!password) {
            delete payload.password; // Don't send empty password
        }

        if (editingUser) {
            dispatch({ type: 'UPDATE_USER', payload });
        } else {
            dispatch({ type: 'ADD_USER', payload });
        }
        onClose();
    };
    
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    if (!isOpen) return null;

    return ReactDOM.createPortal(
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputClasses} placeholder={editingUser ? "Leave blank to keep unchanged" : ""} required={!editingUser}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select name="role" value={formData.role} onChange={handleInputChange} className={inputClasses} required>
                                <option value={UserRole.MANAGER}>Manager</option>
                                <option value={UserRole.TEAM_LEADER}>Team Leader</option>
                            </select>
                        </div>
                        {formData.role === UserRole.TEAM_LEADER && (
                            <div>
                                <label className="block text-sm font-medium">Assigned Team</label>
                                <select name="teamId" value={formData.teamId} onChange={handleInputChange} className={inputClasses} required>
                                    <option value="">Select Team</option>
                                    {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">{editingUser ? 'Update User' : 'Add User'}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};


const GeneralSettings: React.FC = () => {
    const { state, dispatch } = useAppState();
    const currentUserId = sessionStorage.getItem('currentUserId');
    const currentUser = state.users.find(u => u.id === currentUserId);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleAddNewUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };
    
    const handleDeleteUser = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_USER', payload: userId });
        }
    };

    const handlePermissionChange = (role: UserRole, page: string, isChecked: boolean) => {
        const currentPages = state.permissions[role] || [];
        const newPages = isChecked
            ? [...currentPages, page]
            : currentPages.filter(p => p !== page);
        dispatch({ type: 'UPDATE_PERMISSIONS', payload: { role, pages: newPages } });
    };

    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">General Settings</h2>
            <Card title="Organizing Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Organizing Team
                            <HelpCircle size={14} className="text-zinc-400" />
                        </label>
                        <input type="text" value={state.settings.organizingTeam} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {organizingTeam: e.target.value}})} className={inputClasses} />
                        <Tooltip text="The name of the team or committee organizing the event." />
                    </div>
                    <div className="relative group">
                        <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Fest Name
                            <HelpCircle size={14} className="text-zinc-400" />
                        </label>
                        <input type="text" value={state.settings.heading} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {heading: e.target.value}})} className={inputClasses} />
                        <Tooltip text="The main name or title for the festival, displayed on the dashboard and in reports." />
                    </div>
                     <div className="relative group md:col-span-2">
                        <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Fest Description
                            <HelpCircle size={14} className="text-zinc-400" />
                        </label>
                        <textarea
                            rows={3}
                            value={state.settings.description}
                            onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {description: e.target.value}})}
                            className={inputClasses}
                        />
                        <Tooltip text="A short description of the festival, displayed on the dashboard." />
                    </div>
                    <div className="relative group">
                        <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Default Max items/participant
                            <HelpCircle size={14} className="text-zinc-400" />
                        </label>
                        <input type="number" value={state.settings.maxItemsPerParticipant} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {maxItemsPerParticipant: +e.target.value}})} className={inputClasses} />
                        <Tooltip text="The maximum number of items a single participant can enroll in by default." />
                    </div>
                    <div className="relative group">
                        <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Default Participants/item (Team)
                             <HelpCircle size={14} className="text-zinc-400" />
                        </label>
                        <input type="number" value={state.settings.defaultParticipantsPerItem} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {defaultParticipantsPerItem: +e.target.value}})} className={inputClasses} />
                        <Tooltip text="The default number of participants for a group/team item." />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="User Management">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleAddNewUser} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm">Add New User</button>
                    </div>
                    <div className="space-y-2">
                        {state.users.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {user.role === UserRole.MANAGER ? <Shield className="w-5 h-5 text-amber-500"/> : <Users className="w-5 h-5 text-sky-500"/>}
                                    <div>
                                        <p className="font-semibold text-zinc-800 dark:text-zinc-100">{user.username}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {user.role} {user.role === UserRole.TEAM_LEADER && `(${state.teams.find(t=>t.id===user.teamId)?.name || 'Unassigned'})`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditUser(user)} className="text-sm font-medium text-indigo-500 hover:underline">Edit</button>
                                    {user.id !== currentUser?.id && (
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                        <Trash2 size={16} />
                                    </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Role Permissions">
                    <div className="space-y-6">
                        {Object.values(UserRole).map(role => (
                            <div key={role}>
                                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-3">{role} Access</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {Object.values(TABS).map(tab => {
                                        const isChecked = state.permissions[role]?.includes(tab) ?? false;
                                        const isDisabled = role === UserRole.MANAGER && tab === TABS.GENERAL_SETTINGS;
                                        return (
                                            <div key={tab} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`${role}-${tab}`}
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={e => handlePermissionChange(role, tab, e.target.checked)}
                                                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                                />
                                                <label htmlFor={`${role}-${tab}`} className={`ml-2 text-sm ${isDisabled ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                    {tab}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <UserFormModal 
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                editingUser={editingUser}
                currentUser={currentUser}
            />
        </div>
    );
};

export default GeneralSettings;