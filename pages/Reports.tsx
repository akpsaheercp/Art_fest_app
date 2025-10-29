import React from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';

const ReportsPage: React.FC = () => {
  const { state } = useAppState();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="ID Cards">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Generate ID cards for each participant.</p>
            <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Generate</button>
        </Card>
        <Card title="Participants List">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">View and print a list of all participants.</p>
             <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">View/Print</button>
        </Card>
         <Card title="Code Letter List">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Detailed list for each item with names and teams.</p>
             <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">View/Print</button>
        </Card>
         <Card title="Participant Count per Item">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Total number of participants for each item.</p>
             <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">View/Print</button>
        </Card>
        <Card title="Winners List">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">A complete list of all winners.</p>
             <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">View/Print</button>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
