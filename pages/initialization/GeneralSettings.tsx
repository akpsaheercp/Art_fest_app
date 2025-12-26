import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/Card';
import { useFirebase } from '../../hooks/useFirebase';
import { 
    X, Trash2, BookText, Database, Info, Upload, 
    Image as ImageIcon, Check, RotateCcw, 
    ShieldAlert, Edit2, Save, Type, 
    Palette, Calendar as CalendarIcon, 
    Download, RefreshCw, Mail, Phone, MapPin, 
    FileText, Plus, CheckCircle2, UserPlus, Shield, UserCog, CheckSquare, Square
} from 'lucide-react';
import { FontConfig, AppState, Settings, UserRole } from '../../types';
import { TABS } from '../../constants';

// --- Helper Component: Styled Input Group ---
const SettingInput = ({ label, value, onChange, disabled, placeholder, type = "text", className = "" }: { 
    label: string, value: string, onChange: (v: string) => void, disabled: boolean, placeholder?: string, type?: string, className?: string 
}) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">{label}</label>
        {type === "textarea" ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-[#151816] border border-white/5 rounded-2xl text-sm font-bold text-zinc-300 outline-none focus:ring-1 focus:ring-amazio-accent/30 disabled:opacity-60 transition-all min-h-[80px]"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-[#151816] border border-white/5 rounded-2xl text-sm font-bold text-zinc-300 outline-none focus:ring-1 focus:ring-amazio-accent/30 disabled:opacity-60 transition-all"
            />
        )}
    </div>
);

// --- Helper Component: Styled Upload Zone ---
const StyledUploadZone = ({ label, description, value, onChange, disabled }: { 
    label: string, description: string, value: string | undefined, onChange: (v: string) => void, disabled: boolean 
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{label}</label>
            <div 
                onClick={() => !disabled && fileRef.current?.click()}
                className={`flex-grow relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-all duration-300 ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-amazio-accent/50 hover:bg-white/[0.02] cursor-pointer'} ${value ? 'border-amazio-accent/20' : 'border-white/5 bg-black/20'}`}
            >
                {value ? (
                    <img src={value} alt={label} className="max-w-full max-h-48 object-contain drop-shadow-2xl" />
                ) : (
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                            <ImageIcon size={24} />
                        </div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Click to Upload</span>
                    </div>
                )}
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleFile} />
            </div>
            <p className="text-[10px] text-zinc-600 mt-4 text-center italic">{description}</p>
        </div>
    );
};

// --- Helper Component: Language Font Card ---
const LanguageFontCard = ({ title, language, currentFont, previewText, onSave, onDelete }: { 
    title: string; language: 'malayalam' | 'arabic' | 'general'; 
    currentFont?: FontConfig; previewText: string; onSave: (font: Omit<FontConfig, 'id'>) => void; onDelete?: () => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tempBase64, setTempBase64] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTempBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleApply = async () => {
        if (!tempBase64) return;
        setIsSaving(true);
        await onSave({ name: 'Custom Font', url: tempBase64, family: `Custom_${language}_${Date.now()}`, language });
        setTempBase64(null);
        setIsSaving(false);
    };

    return (
        <div className="bg-[#121412] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 shadow-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Type size={20} /></div>
                    <div>
                        <h3 className="text-white font-serif text-lg font-bold">{title}</h3>
                        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{currentFont ? 'Custom Active' : 'System Default'}</span>
                    </div>
                </div>
                {currentFont && (
                    <button onClick={onDelete} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                )}
             </div>

             <div className="bg-black/40 rounded-2xl p-6 border border-white/5 min-h-[100px] flex items-center justify-center">
                <p 
                    className="text-2xl text-white text-center" 
                    style={{ fontFamily: tempBase64 ? 'inherit' : (currentFont ? `'${currentFont.family}', sans-serif` : 'inherit'), direction: language === 'arabic' ? 'rtl' : 'ltr' }}
                >
                    {previewText}
                </p>
             </div>

             <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Upload Font</button>
                <input type="file" ref={fileInputRef} hidden accept=".ttf,.otf,.woff" onChange={handleFileChange} />
                {tempBase64 && (
                    <button onClick={handleApply} className="flex-1 bg-emerald-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Apply</button>
                )}
             </div>
        </div>
    );
};

// --- Scope Permission Card Component ---
const ScopeCard = ({ title, role, permissions, onToggle }: { title: string, role: UserRole, permissions: string[], onToggle: (tab: string) => void }) => {
    return (
        <div className="bg-[#121412] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl h-[500px]">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                <h3 className="text-lg font-black font-serif text-white uppercase tracking-tight">{title}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {Object.values(TABS).filter(t => t !== TABS.PROJECTOR).map(tab => {
                    const isActive = permissions.includes(tab);
                    return (
                        <div 
                            key={tab} 
                            onClick={() => onToggle(tab)}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${isActive ? 'bg-white/[0.03] border-white/10 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/[0.01]'}`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isActive ? 'text-white' : 'text-zinc-500'}`}>{tab}</span>
                            <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${isActive ? 'bg-[#121412] border-emerald-500/50' : 'bg-black/20 border-zinc-700'}`}>
                                {isActive && <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={3} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GeneralSettings: React.FC = () => {
    const { 
        state, updateSettings, deleteUser, 
        updateInstruction, addFont, deleteFont, 
        settingsSubView: activeTab, restoreState, resetFestival, updatePermissions 
    } = useFirebase();
    
    const [instEdit, setInstEdit] = useState(false);
    const [brandEdit, setBrandEdit] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    
    const [instData, setInstData] = useState(state?.settings.institutionDetails || { name: '', address: '', email: '', contactNumber: '', logoUrl: '' });
    const [brandData, setBrandData] = useState({
        festivalName: state?.settings.festivalName || '',
        organizingTeam: state?.settings.organizingTeam || '',
        heading: state?.settings.heading || '',
        description: state?.settings.description || '',
        eventDates: state?.settings.eventDates || [],
        branding: state?.settings.branding || { typographyUrl: '', teamLogoUrl: '' }
    });

    const [newDate, setNewDate] = useState('');
    const restoreInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        if (state) {
            if (!instEdit) setInstData(state.settings.institutionDetails || { name: '', address: '', email: '', contactNumber: '', logoUrl: '' });
            if (!brandEdit) setBrandData({
                festivalName: state.settings.festivalName || '',
                organizingTeam: state.settings.organizingTeam,
                heading: state.settings.heading,
                description: state.settings.description,
                eventDates: state.settings.eventDates || [],
                branding: state.settings.branding || { typographyUrl: '', teamLogoUrl: '' }
            });
        }
    }, [state, instEdit, brandEdit]);

    if (!state) return null;

    const handleAddDate = () => {
        if (!newDate) return;
        if (brandData.eventDates.includes(newDate)) return;
        setBrandData(prev => ({ ...prev, eventDates: [...prev.eventDates, newDate].sort() }));
        setNewDate('');
    };

    const handleRemoveDate = (date: string) => {
        setBrandData(prev => ({ ...prev, eventDates: prev.eventDates.filter(d => d !== date) }));
    };

    const saveInst = async () => {
        await updateSettings({ institutionDetails: instData });
        setInstEdit(false);
    };

    const saveBrand = async () => {
        await updateSettings({ 
            festivalName: brandData.festivalName,
            organizingTeam: brandData.organizingTeam,
            heading: brandData.heading,
            description: brandData.description,
            eventDates: brandData.eventDates,
            branding: brandData.branding
        });
        setBrandEdit(false);
    };

    const handleTogglePermission = (role: UserRole, tab: string) => {
        const current = state.permissions[role] || [];
        const next = current.includes(tab) ? current.filter(t => t !== tab) : [...current, tab];
        updatePermissions({ role, pages: next });
    };

    const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("RESTORE WARNING: This will overwrite all current festival data. This process cannot be undone. Proceed?")) {
            e.target.value = '';
            return;
        }

        setIsRestoring(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                await restoreState(data);
                alert("Festival data successfully restored.");
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Restore failed: Invalid data format.");
            } finally {
                setIsRestoring(false);
                if (restoreInputRef.current) restoreInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        {/* Institution Core Block */}
                        <div className="bg-[#121412]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-amazio-accent rounded-full shadow-[0_0_15px_rgba(154,168,106,0.4)]"></div>
                                    <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Institution Core</h3>
                                </div>
                                {instEdit ? (
                                    <button onClick={saveInst} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Save size={18}/></button>
                                ) : (
                                    <button onClick={() => setInstEdit(true)} className="p-2.5 text-zinc-500 hover:text-white transition-colors"><Edit2 size={20}/></button>
                                )}
                            </div>
                            
                            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-7 space-y-6">
                                    <SettingInput label="Legal Name" value={instData.name} onChange={v => setInstData({...instData, name: v})} disabled={!instEdit} placeholder="e.g. Darusuffa Academy" />
                                    <SettingInput label="Postal Address" type="textarea" value={instData.address} onChange={v => setInstData({...instData, address: v})} disabled={!instEdit} placeholder="Full physical address..." />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <SettingInput label="Email" type="email" value={instData.email} onChange={v => setInstData({...instData, email: v})} disabled={!instEdit} placeholder="contact@institution.com" />
                                        <SettingInput label="Contact No" type="tel" value={instData.contactNumber} onChange={v => setInstData({...instData, contactNumber: v})} disabled={!instEdit} placeholder="+91..." />
                                    </div>
                                </div>
                                <div className="lg:col-span-5">
                                    <StyledUploadZone label="Institutional Emblem" description="Primary watermark for reports and certificates." value={instData.logoUrl} onChange={v => setInstData({...instData, logoUrl: v})} disabled={!instEdit} />
                                </div>
                            </div>
                        </div>

                        {/* Event Branding Block */}
                        <div className="bg-[#121412]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                                    <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Event Branding</h3>
                                </div>
                                {brandEdit ? (
                                    <button onClick={saveBrand} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Save size={18}/></button>
                                ) : (
                                    <button onClick={() => setBrandEdit(true)} className="p-2.5 text-zinc-500 hover:text-white transition-colors"><Edit2 size={20}/></button>
                                )}
                            </div>

                            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-7 space-y-6">
                                    <SettingInput label="Festival Name" value={brandData.festivalName} onChange={v => setBrandData({...brandData, festivalName: v})} disabled={!brandEdit} placeholder="e.g. AMAZIO" />
                                    <SettingInput label="Organizing Body" value={brandData.organizingTeam} onChange={v => setBrandData({...brandData, organizingTeam: v})} disabled={!brandEdit} placeholder="e.g. Students Association" />
                                    <SettingInput label="Festival Theme Title" value={brandData.heading} onChange={v => setBrandData({...brandData, heading: v})} disabled={!brandEdit} placeholder="e.g. Amazio_2026" />
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Main Event Dates</label>
                                            <CalendarIcon size={12} className="text-zinc-500" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#151816] border border-white/5 rounded-2xl min-h-[58px]">
                                            {brandData.eventDates.map(date => (
                                                <div key={date} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 animate-in zoom-in-95">
                                                    {date}
                                                    {brandEdit && <button onClick={() => handleRemoveDate(date)} className="p-0.5 hover:text-rose-500 transition-colors"><X size={14}/></button>}
                                                </div>
                                            ))}
                                            {brandEdit && (
                                                <div className="flex items-center gap-2">
                                                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-transparent border-none text-xs text-indigo-400 outline-none p-0 cursor-pointer w-24" />
                                                    <button onClick={handleAddDate} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:scale-105 active:scale-95 transition-all"><Plus size={14} strokeWidth={3}/></button>
                                                </div>
                                            )}
                                            {brandData.eventDates.length === 0 && !brandEdit && <span className="text-zinc-600 text-xs italic">No dates configured</span>}
                                        </div>
                                    </div>

                                    <SettingInput label="Dashboard Tagline" value={brandData.description} onChange={v => setBrandData({...brandData, description: v})} disabled={!brandEdit} placeholder="Knowledge Fest, to the Wisdom" />
                                </div>
                                <div className="lg:col-span-5">
                                    <StyledUploadZone label="Stylized Event Logo" description="High-resolution PNG for main dashboard hero section." value={brandData.branding.typographyUrl} onChange={v => setBrandData({...brandData, branding: { ...brandData.branding, typographyUrl: v }})} disabled={!brandEdit} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'display': 
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-5 w-1.5 bg-purple-500 rounded-full"></div>
                            <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Typography Library</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <LanguageFontCard title="Malayalam Font" language="malayalam" previewText="മലയാളം ഫോണ്ട് പ്രിവ്യൂ" currentFont={state.fonts.find(f => f.language === 'malayalam')} onSave={addFont} onDelete={() => { const f = state.fonts.find(f => f.language === 'malayalam'); if(f) deleteFont(f.id); }} />
                            <LanguageFontCard title="Arabic Font" language="arabic" previewText="معാينة خط اللغة العربية" currentFont={state.fonts.find(f => f.language === 'arabic')} onSave={addFont} onDelete={() => { const f = state.fonts.find(f => f.language === 'arabic'); if(f) deleteFont(f.id); }} />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
                        {/* Authorized Access Registry Card */}
                        <div className="bg-[#121412] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                             <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                                    <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Authorized Access Registry</h3>
                                </div>
                                <button className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">
                                    <Plus size={16} strokeWidth={3} /> Add Operator
                                </button>
                            </div>

                            <div className="p-1">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                        <tr>
                                            <th className="px-10 py-6">Account Handle</th>
                                            <th className="px-10 py-6 text-center">Role Priority</th>
                                            <th className="px-10 py-6">Assigned Entity</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {state.users.map(u => {
                                            const roleColors: Record<string, string> = {
                                                [UserRole.MANAGER]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                                [UserRole.JUDGE]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                                                [UserRole.TEAM_LEADER]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                                [UserRole.THIRD_PARTY]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                                            };
                                            
                                            // Find Entity display name
                                            let entityName = '--';
                                            if (u.role === UserRole.JUDGE && u.judgeId) {
                                                entityName = state.judges.find(j => j.id === u.judgeId)?.name || 'Judge Profile';
                                            } else if (u.role === UserRole.TEAM_LEADER && u.teamId) {
                                                entityName = state.teams.find(t => t.id === u.teamId)?.name || 'Team Profile';
                                            }

                                            return (
                                                <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-10 py-8 text-sm font-black uppercase tracking-tight text-white">{u.username}</td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${roleColors[u.role]}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-sm font-bold text-zinc-400">{entityName}</td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2.5 text-zinc-500 hover:text-white transition-colors"><Edit2 size={16}/></button>
                                                            <button onClick={() => deleteUser(u.id)} className="p-2.5 text-zinc-500 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Scopes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ScopeCard 
                                title="Team Leader Scopes" 
                                role={UserRole.TEAM_LEADER} 
                                permissions={state.permissions[UserRole.TEAM_LEADER] || []} 
                                onToggle={(tab) => handleTogglePermission(UserRole.TEAM_LEADER, tab)} 
                            />
                            <ScopeCard 
                                title="Third Party Scopes" 
                                role={UserRole.THIRD_PARTY} 
                                permissions={state.permissions[UserRole.THIRD_PARTY] || []} 
                                onToggle={(tab) => handleTogglePermission(UserRole.THIRD_PARTY, tab)} 
                            />
                            <ScopeCard 
                                title="Judge Scopes" 
                                role={UserRole.JUDGE} 
                                permissions={state.permissions[UserRole.JUDGE] || []} 
                                onToggle={(tab) => handleTogglePermission(UserRole.JUDGE, tab)} 
                            />
                        </div>
                    </div>
                );
            case 'instructions':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-5 w-1.5 bg-amber-500 rounded-full"></div>
                            <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Contextual Guidance</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.values(TABS).filter(tab => tab !== TABS.PROJECTOR).map(tab => (
                                <div key={tab} className="p-6 rounded-[2rem] border border-white/5 bg-[#121412]">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">{tab}</label>
                                    <textarea 
                                        defaultValue={state.settings.instructions?.[tab] || ''}
                                        onBlur={(e) => updateInstruction({ page: tab, text: e.target.value })}
                                        className="w-full p-4 bg-black/20 border border-white/5 rounded-2xl text-sm font-medium text-zinc-400 min-h-[100px] outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                                        placeholder={`Enter guide text for ${tab}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'data':
                const handleBackup = () => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
                    const dlNode = document.createElement('a');
                    dlNode.setAttribute("href", dataStr);
                    dlNode.setAttribute("download", `art_fest_backup_${new Date().toISOString().split('T')[0]}.json`);
                    document.body.appendChild(dlNode);
                    dlNode.click();
                    dlNode.remove();
                };
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-5 w-1.5 bg-rose-500 rounded-full"></div>
                            <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">Continuity & Sovereignty</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Card title="Cold Storage">
                                <div className="space-y-6">
                                    <p className="text-xs font-medium leading-relaxed text-zinc-400">Manage your festival registry. You can export the entire state for safekeeping or restore from a previously created JSON backup.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button onClick={handleBackup} className="flex items-center justify-center gap-3 py-4 bg-amazio-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"><Download size={18} /> Export Backup</button>
                                        <button onClick={() => restoreInputRef.current?.click()} className="flex items-center justify-center gap-3 py-4 bg-white/5 text-zinc-300 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                            {isRestoring ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />} 
                                            Restore State
                                        </button>
                                        <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreData} />
                                    </div>
                                </div>
                            </Card>
                            <Card title="Danger Zone">
                                <div className="space-y-6">
                                    <p className="text-xs font-medium leading-relaxed text-rose-400/80">Resetting will delete all competitive data (participants, scores, results). Core settings and users are preserved.</p>
                                    <button onClick={resetFestival} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18} /> Reset Competition Data</button>
                                </div>
                            </Card>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-2 pb-24 max-w-6xl mx-auto">
            <div className="mb-10">
                <h2 className="text-5xl font-black font-serif text-amazio-primary dark:text-white tracking-tighter uppercase leading-none mb-2">Settings</h2>
                <p className="text-zinc-500 font-medium italic text-lg">System orchestration console.</p>
            </div>
            {renderTabContent()}
        </div>
    );
};

export default GeneralSettings;