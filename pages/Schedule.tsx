
import React, { useState } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { GoogleGenAI, Type } from "@google/genai";
import { ScheduledEvent } from '../types';

const SchedulePage: React.FC = () => {
    const { state, dispatch } = useAppState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [constraints, setConstraints] = useState('Ensure events for the same participant do not overlap. Try to schedule similar types of events together.');

    const generateScheduleWithAI = async () => {
        if (!process.env.API_KEY) {
            setError('API key is not configured.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const { items, categories, participants } = state;

        const prompt = `
            You are an expert event scheduler for an Art Festival. Your task is to create an optimized, conflict-free schedule.
            
            Here are the events to schedule. Each event is an item for a specific category. You must use the provided IDs for items and categories.
            
            Items available:
            ${items.map(item => `- Name: ${item.name}, ID: ${item.id}, Category ID: ${item.categoryId}`).join('\n')}
            
            Categories available:
            ${categories.map(c => `- Name: ${c.name}, ID: ${c.id}`).join('\n')}

            Participants and the items they are registered for:
            ${participants.map(p => `- ${p.name} is in: ${p.itemIds.map(id => items.find(i => i.id === id)?.name).join(', ')}`).join('\n')}

            Here are the scheduling constraints to follow:
            ${constraints}

            Generate a schedule based on all this information.
        `;
        
        try {
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A unique string for the scheduled event. e.g., sch-123" },
                    itemId: { type: Type.STRING, description: "The ID of the item." },
                    categoryId: { type: Type.STRING, description: "The ID of the category for that item." },
                    date: { type: Type.STRING, description: "A string representing the date, e.g., 'Day 1'." },
                    time: { type: Type.STRING, description: "A string for the time slot, e.g., '10:00 AM - 11:00 AM'." },
                    stage: { type: Type.STRING, description: "A string for the location, e.g., 'Main Stage' or 'Auditorium'." },
                  },
                  required: ['id', 'itemId', 'categoryId', 'date', 'time', 'stage']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema,
                 },
            });
            const jsonText = response.text.trim();
            const schedule = JSON.parse(jsonText) as ScheduledEvent[];
            dispatch({ type: 'SET_SCHEDULE', payload: schedule });
        } catch (e) {
            console.error(e);
            setError('Failed to generate schedule. The AI might have returned an invalid format.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Event Schedule</h2>
            <Card title="Generate Schedule">
                <div>
                    <label htmlFor="constraints" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Scheduling Constraints</label>
                    <textarea
                        id="constraints"
                        rows={3}
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        className="mt-1 block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                </div>
                <div className="mt-4">
                    <button
                        onClick={generateScheduleWithAI}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </Card>

            <Card title="Generated Schedule">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stage</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                            {state.schedule.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{event.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{event.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{state.items.find(i => i.id === event.itemId)?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{state.categories.find(c => c.id === event.categoryId)?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{event.stage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SchedulePage;