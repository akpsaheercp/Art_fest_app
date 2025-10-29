
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">{title}</h3>
      {children}
    </div>
  );
};

export default Card;