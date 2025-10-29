import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAppState } from '../../hooks/useAppState';
import { Grade } from '../../types';


const GradePointsManager: React.FC<{ itemType: 'single' | 'group' }> = ({ itemType }) => {
    const { state, dispatch } = useAppState();
    const grades = state.gradePoints[itemType];
    const [formData, setFormData] = useState<Omit<Grade, 'id'>>({ name: '', lowerLimit: 0, upperLimit: 100, points: 0 });
    const inputClasses = "block w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-700 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name) return;
        dispatch({ type: 'ADD_GRADE', payload: { itemType, grade: { ...formData, id: `g${Date.now()}` } } });
        setFormData({ name: '', lowerLimit: 0, upperLimit: 100, points: 0 }); // Reset form
    };

    return (
        <div>
            <h4 className="text-lg font-medium capitalize mb-2">{itemType} Item Grades</h4>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4 items-end">
                <input type="text" placeholder="Grade Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputClasses} sm:col-span-2`} required/>
                <input type="number" placeholder="Min Mark" value={formData.lowerLimit} onChange={e => setFormData({...formData, lowerLimit: +e.target.value})} className={inputClasses}/>
                <input type="number" placeholder="Max Mark" value={formData.upperLimit} onChange={e => setFormData({...formData, upperLimit: +e.target.value})} className={inputClasses}/>
                <input type="number" placeholder="Points" value={formData.points} onChange={e => setFormData({...formData, points: +e.target.value})} className={inputClasses}/>
                <button type="submit" className="sm:col-span-5 px-4 py-2 mt-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm">Add Grade</button>
            </form>
            <ul className="space-y-2">
                {grades.map(grade => (
                    <li key={grade.id} className="flex justify-between items-center p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md text-sm">
                        <span><strong>{grade.name}</strong> ({grade.lowerLimit}-{grade.upperLimit}): {grade.points} pts</span>
                        <button onClick={() => dispatch({type: 'DELETE_GRADE', payload: {itemType, gradeId: grade.id}})} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const GradePoints: React.FC = () => {
    return (
        <Card title="Grade Points">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GradePointsManager itemType="single" />
                <GradePointsManager itemType="group" />
            </div>
        </Card>
    );
};

export default GradePoints;
