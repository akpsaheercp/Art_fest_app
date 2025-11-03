
import React, { useState } from 'react';
import { User, Lock, Sun, Moon } from 'lucide-react';

interface LoginPageProps {
    onLogin: (user: string, pass: string) => boolean;
    theme: string;
    toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, toggleTheme }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className="relative min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans transition-colors duration-300">
             <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-3 rounded-full text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle theme"
                title="Toggle light/dark theme"
            >
                {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </button>
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl transform transition-all">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Art Fest Manager</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">Welcome back! Please sign in to continue.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Username"
                        />
                    </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Password"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
