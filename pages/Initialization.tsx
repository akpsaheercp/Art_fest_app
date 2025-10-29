
import React, { useState } from 'react';
import GeneralSettings from './initialization/GeneralSettings';
import TeamsAndCategories from './initialization/TeamsAndCategories';
import ItemsManagement from './initialization/ItemsManagement';
import GradePoints from './initialization/GradePoints';
import CodeLetters from './initialization/CodeLetters';
import { Settings, Users, ClipboardList, Medal, Hash } from 'lucide-react';


const subTabs = [
    { name: 'General Settings', component: GeneralSettings, icon: Settings },
    { name: 'Teams & Categories', component: TeamsAndCategories, icon: Users },
    { name: 'Items', component: ItemsManagement, icon: ClipboardList },
    { name: 'Grade Points', component: GradePoints, icon: Medal },
    { name: 'Code Letters', component: CodeLetters, icon: Hash },
];

const InitializationPage: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState(subTabs[0].name);

    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Initialization & Settings</h2>
            
            <div className="border-b border-zinc-200 dark:border-zinc-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {subTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveSubTab(tab.name)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                                    ${activeSubTab === tab.name
                                        ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-500'
                                    }`}
                            >
                                <Icon className="mr-2 h-5 w-5" />
                                {tab.name}
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-4">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default InitializationPage;