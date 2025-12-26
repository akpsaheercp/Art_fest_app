import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Card from '../../components/Card';
import { useFirebase } from '../../hooks/useFirebase';
import { 
    X, Users, Trash2, BookText, Database, Info, FileDown, Upload, ArrowRight, 
    Building2, Briefcase, Image as ImageIcon, Check, LayoutTemplate, RotateCcw, 
    ShieldAlert, Award, Edit2, Save, Type, CheckCircle, CheckCircle2, ClipboardList, Plus, FileText, 
    MoreHorizontal, Settings, Palette, Calendar, SlidersHorizontal, MousePointer2, 
    UserCheck, Shield, LayoutDashboard, UserPlus, Medal, Gavel, Timer, Monitor,
    BarChart2, Home, Search, AlertTriangle, ShieldCheck, Download, History, Undo2,
    Sparkles, RefreshCw
} from 'lucide-react';
import { User, UserRole, FontConfig, LogEntry } from '../../types';
import { TABS, TAB_DISPLAY_NAMES } from '../../constants';

// --- Helper Component: Image Upload ---
interface ImageUploadProps {
    label: string;
    description: string;
    currentValue: string | undefined;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, description, currentValue, onChange, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { alert("File too large! Max 500KB."); return; }
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className={`h-full flex flex-col justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50/50 dark:bg-black/20 ${disabled ? 'opacity-60 pointer-events-none' : 'hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors'}`}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">{label}</label>
            <div className="flex-grow flex flex-col items-center justify-center gap-4">
                {currentValue ? (
                    <div className="relative w-full aspect-video bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden p-2 group">
                        <img src={currentValue} alt={label} className="max-w-full max-h-full object-contain" />
                        {!disabled && <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}><span className="text-white text-xs font-bold flex items-center gap-2"><Upload size={14}/> Replace</span></div>}
                    </div>
                ) : (
                    <div onClick={() => !disabled && fileInputRef.current?.click()} className="w-full aspect-video bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                        <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors"><ImageIcon size={24} /></div>
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">Click to Upload</span>
                    </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} disabled={disabled} />
            </div>
        </div>
    );
};

// --- Helper Component: Language Font Card ---
const LanguageFontCard = ({ title, subtitle, language, currentFont, previewText, onSave, onDelete }: { 
    title: string; subtitle: string; language: 'malayalam' | 'arabic' | 'general'; 
    currentFont?: FontConfig; previewText: string; onSave: (font: Omit<FontConfig, 'id'>) => void; onDelete?: () => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tempBase64, setTempBase64] = useState<string | null>(null);
    const [tempName, setTempName] = useState(currentFont?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    // Update tempName when currentFont changes externally
    useEffect(() => {
        if (!tempBase64) setTempName(currentFont?.name || '');
    }, [currentFont, tempBase64]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert("Font file too large! Max 2MB."); return; }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempBase64(reader.result as string);
                setTempName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = async () => {
        if (!tempBase64) return;
        setIsSaving(true);
        try {
            await onSave({ 
                name: tempName, 
                url: tempBase64, 
                family: `Custom_${language}_${Date.now()}`, 
                language 
            });
            setTempBase64(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!onDelete) return;
        if (confirm(`Revert ${title} to system default? This will remove the custom font file.`)) {
            setIsSaving(true);
            try {
                await onDelete();
                setTempBase64(null);
                setTempName('');
            } catch (e) {
                console.error(e);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="bg-[#121412] border border-zinc-800 rounded-[2rem] p-8 flex flex-col gap-6 shadow-xl relative group">
             <div className="flex items-start justify-between">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-900/10 flex items-center justify-center text-emerald-500 border border-emerald-900/20 shadow-inner"><Type size={24} /></div>
                    <div>
                        <h3 className="text-white font-serif text-xl font-bold tracking-tight">{title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {currentFont ? (
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    <Check size={10} strokeWidth={3} /> Active: {currentFont.name}
                                </span>
                            ) : (
                                <span className="text-[9px] font-black uppercase text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-md border border-zinc-500/20">
                                    System Default
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {currentFont && !tempBase64 && (
                    <button 
                        onClick={handleReset} 
                        disabled={isSaving}
                        className="p-2.5 text-zinc-500 hover:text-rose-500 bg-zinc-800/50 hover:bg-rose-500/10 rounded-xl transition-all border border-zinc-700"
                        title="Remove Custom Font"
                    >
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <RotateCcw size={16}/>}
                    </button>
                )}
             </div>

             <div className="bg-[#050605] rounded-3xl p-8 border border-zinc-800/50 min-h-[140px] flex flex-col justify-center relative group/preview">
                <p 
                    className="text-3xl text-white text-center leading-relaxed transition-all duration-500" 
                    style={{ 
                        fontFamily: tempBase64 ? 'inherit' : (currentFont ? `'${currentFont.family}', sans-serif` : 'inherit'), 
                        direction: language === 'arabic' ? 'rtl' : 'ltr' 
                    }}
                >
                    {previewText}
                </p>
                {tempBase64 && (
                    <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] rounded-3xl flex items-center justify-center animate-in fade-in zoom-in-95">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-black/60 px-4 py-2 rounded-full border border-emerald-500/30">Preview Pending Apply</span>
                    </div>
                )}
             </div>

             <div className="flex gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`flex-1 px-5 py-4 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${tempBase64 ? 'border-zinc-600 bg-zinc-700 text-white' : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white'}`}
                >
                    {tempBase64 ? 'Change Selection' : currentFont ? 'Replace Font' : 'Upload Font'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".ttf,.otf,.woff" onChange={handleFileChange} />
                
                {tempBase64 && (
                    <button 
                        onClick={handleApply} 
                        disabled={isSaving} 
                        className={`flex-1 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2`}
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        Apply New Font
                    </button>
                )}

                {tempBase64 && (
                    <button 
                        onClick={() => { setTempBase64(null); setTempName(currentFont?.name || ''); }} 
                        className="px-4 py-4 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                )}
             </div>
        </div>
    );
};

const SectionTitle = ({ title, icon: Icon, color = 'indigo' }: { title: string, icon?: any, color?: string }) => {
    const colors: Record<string, string> = { indigo: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]', emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]', amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]', purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]', rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' };
    return (<div className="flex items-center gap-3 mb-6"><div className={`h-5 w-1.5 rounded-full ${colors[color] || colors.indigo}`}></div><h3 className="text-xl font-black font-serif text-amazio-primary dark:text-white uppercase tracking-tighter">{title}</h3>{Icon && <Icon className="text-zinc-400 ml-1" size={18} />}</div>);
};

const GeneralSettings: React.FC = () => {
    const { state, updateSettings, addUser, updateUser, deleteUser, updatePermissions, updateInstruction, addFont, deleteFont, settingsSubView: activeTab } = useFirebase();
    const [instData, setInstData] = useState(state?.settings.institutionDetails || { name: '', address: '', email: '', contactNumber: '', description: '', logoUrl: '' });
    const [orgData, setOrgData] = useState({ organizingTeam: state?.settings.organizingTeam || '', heading: state?.settings.heading || '', description: state?.settings.description || '', eventDates: state?.settings.eventDates || [], branding: state?.settings.branding || { typographyUrl: '', teamLogoUrl: '' } });
    const [isEditingInst, setIsEditingInst] = useState(false);
    const [isEditingOrg, setIsEditingOrg] = useState(false);

    useEffect(() => { if (!isEditingInst && state?.settings.institutionDetails) setInstData(state.settings.institutionDetails); }, [state?.settings.institutionDetails, isEditingInst]);
    useEffect(() => { if (!isEditingOrg && state?.settings) setOrgData({ organizingTeam: state.settings.organizingTeam, heading: state.settings.heading, description: state.settings.description, eventDates: state.settings.eventDates || [], branding: state.settings.branding || { typographyUrl: '', teamLogoUrl: '' } }); }, [state?.settings, isEditingOrg]);

    if (!state) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <div className="space-y-10">
                        <Card title="Institution Core" action={isEditingInst ? <button onClick={async () => { await updateSettings({ institutionDetails: instData }); setIsEditingInst(false); }} className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200"><Check size={20}/></button> : <button onClick={() => setIsEditingInst(true)} className="p-2 text-zinc-400 hover:text-indigo-500"><Edit2 size={18}/></button>}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <input value={instData.name} onChange={e => setInstData({...instData, name: e.target.value})} disabled={!isEditingInst} className="w-full p-4 bg-zinc-50 dark:bg-black/20 border rounded-2xl font-bold" placeholder="Legal Name" />
                                    <textarea value={instData.address} onChange={e => setInstData({...instData, address: e.target.value})} disabled={!isEditingInst} className="w-full p-4 bg-zinc-50 dark:bg-black/20 border rounded-2xl font-bold" placeholder="Address" />
                                </div>
                                <ImageUpload label="Emblem" description="Report watermark" currentValue={instData.logoUrl} onChange={v => setInstData({...instData, logoUrl: v})} disabled={!isEditingInst} />
                            </div>
                        </Card>
                    </div>
                );
            case 'display': 
                return (
                    <div className="space-y-10">
                        <SectionTitle title="Typography Library" icon={Palette} color="purple"/>
                        <p className="text-sm text-zinc-500 -mt-4 mb-6">Manage language-specific fonts. Uploaded fonts will automatically map to Malayalam and Arabic text across the entire platform. Reverting will fallback to system default fonts (Inter/Roboto Slab).</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LanguageFontCard title="Malayalam Font" subtitle="Global mapping" language="malayalam" previewText="മലയാളം ഫോണ്ട് പ്രിവ്യൂ" currentFont={state.fonts.find(f => f.language === 'malayalam')} onSave={addFont} onDelete={() => { const f = state.fonts.find(f => f.language === 'malayalam'); if(f) return deleteFont(f.id); }} />
                            <LanguageFontCard title="Arabic Font" subtitle="Global mapping" language="arabic" previewText="معاينة خط اللغة العربية" currentFont={state.fonts.find(f => f.language === 'arabic')} onSave={addFont} onDelete={() => { const f = state.fonts.find(f => f.language === 'arabic'); if(f) return deleteFont(f.id); }} />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <Card title="Registry Scopes">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-900 text-[9px] font-black uppercase text-zinc-400">
                                    <tr><th className="px-6 py-4">Handle</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                                    {state.users.map(u => (
                                        <tr key={u.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                                            <td className="px-6 py-4 text-xs font-black uppercase">{u.username}</td>
                                            <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-700">{u.role}</span></td>
                                            <td className="px-6 py-4 text-right"><button onClick={() => deleteUser(u.id)} className="p-2 text-zinc-400 hover:text-rose-500"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <h2 className="text-5xl font-black font-serif text-amazio-primary dark:text-white tracking-tighter uppercase">Settings</h2>
            {renderTabContent()}
        </div>
    );
};

export default GeneralSettings;