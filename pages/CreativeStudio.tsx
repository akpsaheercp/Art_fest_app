import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { 
    Layout, Download, ChevronDown, 
    Loader2, Image as ImageIcon, Palette, Globe,
    Plus, Trash2, Check, Type, Award, Layers, User, MapPin, X,
    Settings2, ChevronUp, ImagePlus
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ResultStatus, ItemType, PerformanceType } from '../types';

// --- Utils ---
const compressBgImage = (base64Str: string, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width; let height = img.height;
            if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } } 
            else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str); 
    });
};

type TemplateType = 'CLASSIC' | 'MINIMAL' | 'HERITAGE';
interface PosterData { itemId: string; itemName: string; categoryName: string; resultNumber: string; winners: any[]; }

const TEMPLATES: Record<TemplateType, any> = {
    CLASSIC: { name: 'Classic Paper', bg: 'bg-[#F9F7F1]', text: 'text-slate-900', fontTitle: 'font-serif' },
    MINIMAL: { name: 'Clean Minimal', bg: 'bg-white', text: 'text-zinc-900', fontTitle: 'font-sans' },
    HERITAGE: { name: 'Heritage Sketch', bg: 'bg-white', text: 'text-black', fontTitle: 'font-serif' }
};

const PosterCanvas: React.FC<{ data: PosterData; template: TemplateType; settings: any; scale?: number; id?: string; customBg?: string | null; showPoints?: boolean; }> = ({ data, template, settings, scale = 1, id, customBg, showPoints = true }) => {
    const style = TEMPLATES[template];
    return (
        <div id={id} className={`relative flex flex-col overflow-hidden shadow-2xl ${style.fontTitle} bg-white text-zinc-900`} style={{ width: '1080px', height: '1080px', transform: `scale(${scale})`, transformOrigin: 'top left', flexShrink: 0 }}>
            {customBg ? <img src={customBg} className="absolute inset-0 z-0 w-full h-full object-cover" /> : <div className={`absolute inset-0 z-0 ${style.bg}`}></div>}
            <div className="relative z-10 flex flex-col h-full p-20">
                <div className="mb-16"><h1 className="text-8xl font-black uppercase tracking-tighter text-zinc-900">{data.itemName}</h1><p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-600">{data.categoryName}</p></div>
                <div className="flex-grow flex flex-col justify-center space-y-12">
                    {data.winners.map((w: any, i: number) => (
                        <div key={i} className="flex justify-between items-center animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i*100}ms` }}>
                            <div><span className="text-7xl font-black text-amber-500 mr-8">{w.rank}</span><span className="text-5xl font-black uppercase">{w.name}</span><div className="text-xl font-bold text-zinc-400 mt-1">{w.team}</div></div>
                            {showPoints && <div className="text-6xl font-black text-emerald-500">+{w.points}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CreativeStudio: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const { state, addAsset, deleteAsset, addTemplate, deleteTemplate } = useFirebase();
    const [template, setTemplate] = useState<TemplateType>('CLASSIC');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [selectedBgUrl, setSelectedBgUrl] = useState<string | null>(null);
    const [showPoints, setShowPoints] = useState(true);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const declaredItems = useMemo(() => state?.results.filter(r => r.status === ResultStatus.DECLARED).map(r => ({ id: r.itemId, name: state.items.find(i=>i.id===r.itemId)?.name || 'N/A', result: r })) || [], [state]);

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && state) {
            const reader = new FileReader();
            reader.onload = async () => {
                const compressed = await compressBgImage(reader.result as string);
                await addAsset({ url: compressed, name: file.name, type: 'background' });
                setSelectedBgUrl(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    const posterData = useMemo(() => {
        if (!state || !selectedItemId) return null;
        const entry = declaredItems.find(i => i.id === selectedItemId);
        if (!entry) return null;
        const item = state.items.find(i => i.id === selectedItemId);
        const winners = entry.result.winners.filter((w: any) => w.position > 0).sort((a: any, b: any) => a.position - b.position).map((w: any) => ({
            rank: w.position, name: w.participantId, team: 'Team', points: 10
        }));
        return { itemId: selectedItemId, itemName: item?.name || '', categoryName: 'Category', winners, resultNumber: '01' };
    }, [state, selectedItemId, declaredItems]);

    if (!state) return <Loader2 className="animate-spin" />;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 bg-white dark:bg-amazio-bg border-b flex justify-between items-center">
                <h2 className="text-xl font-black uppercase">Creative Studio</h2>
                <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="bg-zinc-100 p-2 rounded-xl text-[10px] font-black">
                    <option value="">Select Result</option>
                    {declaredItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 bg-zinc-50 dark:bg-zinc-900 p-6 border-r flex flex-col gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-[10px] font-black uppercase text-zinc-400">Backgrounds</h3><button onClick={() => bgInputRef.current?.click()} className="p-1 bg-indigo-50 text-indigo-600 rounded-md"><Plus size={16}/></button></div>
                        <input type="file" ref={bgInputRef} className="hidden" onChange={handleBgUpload} />
                        <div className="grid grid-cols-3 gap-2">
                            {state.assets.filter(a => a.type === 'background').map(a => (
                                <div key={a.id} className="relative aspect-square">
                                    <img src={a.url} onClick={() => setSelectedBgUrl(a.url)} className={`w-full h-full object-cover rounded-lg cursor-pointer border-2 ${selectedBgUrl === a.url ? 'border-indigo-500' : 'border-transparent'}`} />
                                    <button onClick={() => deleteAsset(a.id)} className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full"><X size={8}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="flex-1 bg-zinc-200 dark:bg-black p-10 flex items-center justify-center">
                    {posterData && <PosterCanvas data={posterData as any} template={template} settings={state.settings} scale={0.5} customBg={selectedBgUrl} showPoints={showPoints} id="poster-canvas-el" />}
                </main>
            </div>
        </div>
    );
};

export default CreativeStudio;