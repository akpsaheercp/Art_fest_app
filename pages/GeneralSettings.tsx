
import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Card from '../../components/Card';
import { useFirebase } from '../../hooks/useFirebase';
import { X, Users, Trash2, BookText, Database, Info, FileDown, Upload, ArrowRight, Building2, Briefcase, Image as ImageIcon, Check, LayoutTemplate, RotateCcw, ShieldAlert, Award, Edit2, Save, Type, CheckCircle, Plus, FileText, MoreHorizontal, RefreshCw } from 'lucide-react';
import { User, UserRole, AppState, FontConfig } from '../../types';
import { TABS } from '../../constants';
import { CollapsibleCard } from '../../components/CollapsibleCard'; // Import CollapsibleCard

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
            // Check file size (e.g. limit to 500KB to prevent Firestore document bloat)
            if (file.size > 500 * 1024) {
                alert("File size too large! Please upload an image smaller than 500KB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800/30 ${disabled ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
                {currentValue && !disabled && (
                    <button 
                        onClick={() => onChange('')} 
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                        Remove
                    </button>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                {currentValue ? (
                    <div className="relative w-24 h-16 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                        <img src={currentValue} alt={label} className="max-w-full max-h-full object-contain" />
                        {!disabled && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <span className="text-white text-xs font-bold">Replace</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div 
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        className={`w-24 h-16 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center transition-colors ${!disabled ? 'cursor-pointer hover:border-amber-400' : ''}`}
                    >
                        <ImageIcon className="text-zinc-400 mb-1" size={20} />
                        <span className="text-[10px] text-zinc-500">Upload</span>
                    </div>
                )}
                
                <div className="flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{description}</p>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/svg+xml"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                    {!disabled && (
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()} 
                            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        >
                            {currentValue ? 'Change File' : 'Select File'}
                        </button>
                    )}
                </div>
            </div>
            {!disabled && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                    <Info size={12} />
                    <span>Upload PNG for best quality. Transparent background recommended.</span>
                </div>
            )}
        </div>
    );
};

// --- Helper Component: Font Upload ---
interface FontUploadProps {
    language?: 'malayalam' | 'arabic'; // Optional for general custom fonts
    // FIX: Removed nonexistent GeneralFontConfig from type union.
    currentFont?: FontConfig;
    onSave: (font: FontConfig | undefined) => void;
    onUpload?: (file: File, fontFamilyName: string) => void; // For adding new general custom fonts
    onDelete?: (id: string) => void; // For deleting existing general custom fonts
    fontFamilyName?: string; // For new generic fonts, user defines this initially
}

const FontUpload: React.FC<FontUploadProps> = ({ language, currentFont, onSave, onUpload, onDelete, fontFamilyName: propFontFamilyName }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewText, setPreviewText] = useState(() => {
        if (language === 'malayalam') return 'മലയാളം ഫോണ്ട് പ്രിവ്യൂ';
        if (language === 'arabic') return 'معاينة خط اللغة العربية';
        return 'Custom Font Preview';
    });
    // FIX: Removed nonexistent GeneralFontConfig from state type.
    const [tempFont, setTempFont] = useState<FontConfig | undefined>(currentFont);
    const [isSaving, setIsSaving] = useState(false);
    const [tempFontFamilyName, setTempFontFamilyName] = useState(propFontFamilyName || currentFont?.family || '');
    const { state } = useFirebase();

    useEffect(() => {
        setTempFont(currentFont);
        setTempFontFamilyName(propFontFamilyName || currentFont?.family || '');
    }, [currentFont, propFontFamilyName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert("Font file too large! Please upload a file smaller than 1MB.");
                return;
            }

            // If it's a general custom font being uploaded, we need a family name
            if (!language && !currentFont && !tempFontFamilyName.trim()) {
                alert("Please provide a name for this custom font family before uploading.");
                e.target.value = ''; // Clear file input
                return;
            }

            // Check if font family name is unique if it's a new general custom font being added
            if (!language) { // Only applies to general custom fonts
                // FIX: generalCustomFonts property was removed from Settings, should check fonts collection instead
                const isConflict = state?.fonts.some(f => 
                    (currentFont && f.id !== currentFont.id) && // Exclude self if updating
                    f.family.toLowerCase() === tempFontFamilyName.trim().toLowerCase()
                );
                if (isConflict) {
                    alert(`A font with the family name "${tempFontFamilyName.trim()}" already exists. Please choose a unique name.`);
                    e.target.value = ''; // Clear file input
                    return;
                }
            }


            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const finalFontFamily = language 
                    ? `Custom${language.charAt(0).toUpperCase() + language.slice(1)}`
                    : tempFontFamilyName.trim();
                
                // If it's for adding a new general custom font, use onUpload to handle the ID creation in parent
                if (onUpload && !language) {
                    onUpload(file, finalFontFamily);
                    setTempFontFamilyName(''); // Clear input after upload
                } else {
                    // For language-specific fonts or updating existing general custom fonts:
                    // FIX: Using any type for the partial object since 'id' is required by FontConfig interface but only generated during setDoc.
                    const newFontPartial: any = {
                        name: file.name,
                        url: base64,
                        family: finalFontFamily
                    };
                    setTempFont(currentFont ? { ...newFontPartial, id: currentFont.id } : newFontPartial);
                }
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Clear input after selection
        }
    };

    const handleApply = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 500)); // Simulate delay
        
        // Before saving, ensure the font family name is valid/unique if it's a general custom font being updated
        if (!language && tempFont && tempFontFamilyName.trim()) {
             const isConflict = state?.fonts.some(f => 
                (tempFont && f.id !== tempFont.id) && 
                f.family.toLowerCase() === tempFontFamilyName.trim().toLowerCase()
            );
            if (isConflict) {
                alert(`A font with the family name "${tempFontFamilyName.trim()}" already exists. Please choose a unique name.`);
                setIsSaving(false);
                return;
            }
            onSave(tempFont ? { ...tempFont, family: tempFontFamilyName.trim() } : undefined);
        } else {
            onSave(tempFont);
        }
        setIsSaving(false);
    };

    const handleRemove = () => {
        if (confirm("Remove custom font? System defaults will be used.")) {
            if (onDelete && currentFont) {
                onDelete(currentFont.id);
            } else { // For language-specific fonts, where onDelete is not expected
                setTempFont(undefined);
                onSave(undefined);
            }
        }
    };

    // Inject temporary style for preview
    useEffect(() => {
        if (tempFont?.url && tempFont.family) {
            const styleId = `preview-font-${tempFont.family.replace(/\s/g, '-')}-${tempFont.id || 'temp'}`;
            let style = document.getElementById(styleId) as HTMLStyleElement;
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            style.textContent = `
                @font-face {
                    font-family: '${tempFont.family}';
                    src: url('${tempFont.url}');
                    font-display: swap;
                }
            `;
        }
        // Cleanup function for temporary font styles
        return () => {
            if (tempFont?.family) {
                const styleId = `preview-font-${tempFont.family.replace(/\s/g, '-')}-${tempFont.id || 'temp'}`;
                const style = document.getElementById(styleId);
                if (style) {
                    document.head.removeChild(style);
                }
            }
        };
    }, [tempFont]);

    const inputClasses = "w-full bg-transparent border-none focus:ring-0 text-2xl text-zinc-800 dark:text-zinc-100";
    const languageSpecific = !!language;

    // Determine if the "Apply" button should be disabled for general custom fonts
    const isApplyDisabledForGeneralCustomFont = useMemo(() => {
        if (languageSpecific) return false; // Not applicable for language-specific fonts here

        // Case 1: No font selected or no family name provided
        if (!tempFont || !tempFontFamilyName.trim()) return true;

        // Case 2: No actual changes from currentFont state
        const hasChanges = JSON.stringify(currentFont) !== JSON.stringify({ ...tempFont, family: tempFontFamilyName.trim() });
        if (!hasChanges) return true;

        return false;
    }, [languageSpecific, tempFont, tempFontFamilyName, currentFont]);


    return (
        <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Type size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-100 capitalize">{languageSpecific ? `${language} Font Family` : 'Custom Font Family'}</h4>
                        <p className="text-xs text-zinc-500">{languageSpecific ? `Auto-applies to ${language} text across the app.` : 'For explicit selection in Creative Studio.'}</p>
                    </div>
                </div>
                {tempFont && !onUpload && !tempFont.id && ( // Only show remove for individual language fonts
                    <button onClick={handleRemove} className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        Remove Custom Font
                    </button>
                )}
                {currentFont && currentFont.id && onDelete && ( // Show delete for existing general custom fonts
                    <button onClick={handleRemove} className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        Delete Font
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {!languageSpecific && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Font Family Name</label>
                        <input 
                            type="text" 
                            value={tempFontFamilyName} 
                            onChange={e => setTempFontFamilyName(e.target.value)} 
                            className="w-full p-2 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
                            placeholder="e.g. My Awesome Font"
                        />
                         <p className="text-[10px] text-zinc-400 mt-1">This name will appear in dropdowns for selection.</p>
                    </div>
                )}
                
                {/* Upload Area */}
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".ttf,.otf,.woff,.woff2"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2"
                    >
                        <Upload size={14} /> {tempFont ? 'Change Font File' : 'Upload .ttf/.otf/.woff/.woff2'}
                    </button>
                    {tempFont && <span className="text-xs text-zinc-500 font-mono truncate max-w-[150px]">{tempFont.name}</span>}
                </div>

                {/* Preview Box */}
                <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700/50 rounded-lg p-4">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-bold">Live Preview</p>
                    <input 
                        type="text" 
                        value={previewText} 
                        onChange={e => setPreviewText(e.target.value)}
                        className={inputClasses}
                        style={{ 
                            fontFamily: tempFont && tempFont.family ? `'${tempFont.family}', sans-serif` : 'inherit',
                            direction: language === 'arabic' ? 'rtl' : 'ltr'
                        }}
                    />
                </div>

                {/* Action Footer */}
                <div className="flex justify-end pt-2">
                    {onUpload && !languageSpecific && (!tempFont || !tempFont.id) && ( // Only show if we're in "add new general custom font" mode
                        <button 
                            onClick={() => tempFont && handleApply()} // Call handleApply which will then call onUpload
                            disabled={!tempFont || !tempFontFamilyName.trim()}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Confirm & Add Font
                        </button>
                    )}

                    {(!onUpload || currentFont?.id) && ( // standard apply for language specific or update existing
                         <button 
                            onClick={handleApply}
                            disabled={isApplyDisabledForGeneralCustomFont && !languageSpecific}
                            className={`px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                                isSaving 
                                ? 'bg-zinc-100 text-zinc-400' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                            } disabled:opacity-50`}
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                            {isSaving ? 'Processing...' : (languageSpecific ? `Set ${language} Font` : 'Update Font Family')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* FIX: Removed nonexistent customFonts property reference, using collection state.fonts instead */}
                            <FontUpload language="malayalam" currentFont={state.fonts.find(f => f.language === 'malayalam')} onSave={(f) => { if(f) addFont({ ...f, language: 'malayalam' }); }} />
                            <FontUpload language="arabic" currentFont={state.fonts.find(f => f.language === 'arabic')} onSave={(f) => { if(f) addFont({ ...f, language: 'arabic' }); }} />
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
