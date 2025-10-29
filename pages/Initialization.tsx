
import React from 'react';
import GeneralSettings from './initialization/GeneralSettings';
import TeamsAndCategories from './initialization/TeamsAndCategories';
import ItemsManagement from './initialization/ItemsManagement';
import GradePoints from './initialization/GradePoints';
import CodeLetters from './initialization/CodeLetters';

interface InitializationPageProps {
    activeSubTab: string;
}

const subTabs = [
    { name: 'General Settings', component: GeneralSettings },
    { name: 'Teams & Categories', component: TeamsAndCategories },
    { name: 'Items', component: ItemsManagement },
    { name: 'Grade Points', component: GradePoints },
    { name: 'Code Letters', component: CodeLetters },
];

const InitializationPage: React.FC<InitializationPageProps> = ({ activeSubTab }) => {
    const ActiveComponent = subTabs.find(tab => tab.name === activeSubTab)?.component || GeneralSettings;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Initialization & Settings</h2>
            
            <div className="mt-4">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default InitializationPage;
