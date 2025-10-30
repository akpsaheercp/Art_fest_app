import React from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { HelpCircle } from 'lucide-react';

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute left-1/2 -top-2 -translate-y-full -translate-x-1/2 w-48 p-2 text-xs text-white bg-zinc-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
        <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-700 -translate-x-1/2"></div>
    </div>
);

const GeneralSettings: React.FC = () => {
    const { state, dispatch } = useAppState();
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
    
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
        </div>
    );
};

export default GeneralSettings;