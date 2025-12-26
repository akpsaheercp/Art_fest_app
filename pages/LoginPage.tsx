import React, { useState } from 'react';
/* Added RefreshCw to the list of icons imported from lucide-react */
import { User, Lock, Sun, Moon, Laptop, ArrowRight, LogOut, AlertCircle, Mail, UserPlus, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';
import { Settings } from '../types';

interface LoginPageProps {
    theme: string;
    toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
    settings: Settings;
}

const LoginPage: React.FC<LoginPageProps> = ({ theme, toggleTheme, settings }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register, setupNewFest, logout, firebaseUser, currentUser } = useFirebase();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                if (!username || !email || !password || !confirmPassword) throw new Error("All fields are required");
                if (password !== confirmPassword) throw new Error("Passwords do not match");
                await register(username, email, password);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupNewFest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setError("Please enter a username to continue.");
            return;
        }
        setLoading(true);
        try {
            await setupNewFest(username);
        } catch (err: any) {
            setError(err.message || "Failed to initialize new festival.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setError('');
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 transition-colors duration-500 bg-amazio-light-bg dark:bg-amazio-bg">
            
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-amazio-secondary/10 dark:bg-amazio-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-amazio-accent/20 dark:bg-amazio-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

            <div className="relative w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-white/80 dark:bg-[#121412]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl z-10">
                
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 mb-6 border border-indigo-500/20">
                        {isRegister ? <UserPlus size={32} /> : <Sparkles size={32} />}
                    </div>
                    <h1 className="text-3xl font-black font-serif text-amazio-primary dark:text-white uppercase tracking-tighter leading-none mb-2">
                        {isRegister ? 'Join Amazio' : 'Art Fest Portal'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                        {isRegister ? 'Create your management ecosystem' : 'Manage your creative symphony'}
                    </p>
                </div>

                {firebaseUser && !currentUser ? (
                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-center animate-in fade-in">
                        <AlertCircle className="mx-auto mb-3 text-amber-600" size={32} />
                        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 mb-2">Profile Not Found</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-6 leading-relaxed">
                            You are logged in, but your festival data was not found. Please setup a new festival to continue.
                        </p>
                        
                        <form onSubmit={handleSetupNewFest} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500" />
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    required 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                    placeholder="Festival Manager Name" 
                                />
                            </div>
                            
                            {error && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 text-center text-xs font-bold text-rose-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={16}/> : 'Setup New Festival'}
                                <ArrowRight size={16} />
                            </button>
                        </form>

                        <button onClick={handleLogout} className="mt-4 w-full py-3 bg-white dark:bg-zinc-800 rounded-xl font-bold text-sm shadow-sm border border-zinc-200 dark:border-zinc-700">Sign Out</button>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500" />
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Username" />
                            </div>
                        )}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Email Address" />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Security Key" />
                        </div>

                        {isRegister && (
                            <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${confirmPassword && confirmPassword === password ? 'text-emerald-500' : 'text-zinc-400 group-focus-within:text-indigo-500'}`} />
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-black/20 border transition-all text-sm font-bold outline-none focus:ring-2 ${confirmPassword && confirmPassword === password ? 'border-emerald-500/50 focus:ring-emerald-500/10' : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20'}`} 
                                    placeholder="Confirm Security Key" 
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 text-center text-xs font-bold text-rose-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16}/> : (isRegister ? 'Begin Registration' : 'Enter Portal')}
                            <ArrowRight size={16} />
                        </button>

                        <div className="pt-4 text-center">
                            <button 
                                type="button"
                                onClick={toggleMode}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600"
                            >
                                {isRegister ? 'Already have a fest? Sign In' : 'New Festival? Create Account'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;