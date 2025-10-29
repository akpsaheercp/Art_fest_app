import React from 'react';
import Card from '../components/Card';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">About Art Fest Manager</h2>
      <Card title="The Ultimate Tool for Event Management">
        <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <p>
                The Art Fest Manager is a comprehensive, modern web application designed to streamline the management of cultural and artistic festivals. 
                Built with React, TypeScript, and Tailwind CSS, it offers a seamless and intuitive user experience.
            </p>
            <p>
                From initial setup of teams, categories, and events, to participant registration and intelligent, AI-powered scheduling, this tool covers every aspect of festival organization. 
                It simplifies complex tasks like tabulation, result declaration, and point calculation, allowing organizers to focus on creating a memorable event.
            </p>
             <h4 className="font-semibold text-lg pt-4 border-t border-zinc-200 dark:border-zinc-700">Key Features:</h4>
             <ul className="list-disc list-inside space-y-2">
                <li>Centralized settings and configuration.</li>
                <li>Easy participant data entry and management.</li>
                <li>AI-powered, conflict-free event scheduling using the Gemini API.</li>
                <li>Streamlined tabulation and result processing.</li>
                <li>Real-time points tracking for teams and individuals.</li>
                <li>Comprehensive reporting module for ID cards, lists, and more.</li>
             </ul>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
