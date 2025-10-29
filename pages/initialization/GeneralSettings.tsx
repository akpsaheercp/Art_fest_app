import React from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';

const GeneralSettings: React.FC = () => {
    const { state, dispatch } = useAppState();
    const inputClasses = "mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";
    
    return (
        <Card title="Organizing Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Organizing Team</label>
                    <input type="text" value={state.settings.organizingTeam} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {organizingTeam: e.target.value}})} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Fest Heading</label>
                    <input type="text" value={state.settings.heading} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {heading: e.target.value}})} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Default Max items/participant</label>
                    <input type="number" value={state.settings.maxItemsPerParticipant} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {maxItemsPerParticipant: +e.target.value}})} className={inputClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Default Participants/item (Team)</label>
                    <input type="number" value={state.settings.defaultParticipantsPerItem} onChange={e => dispatch({type: 'UPDATE_SETTINGS', payload: {defaultParticipantsPerItem: +e.target.value}})} className={inputClasses} />
                </div>
            </div>
        </Card>
    );
};

export default GeneralSettings;
