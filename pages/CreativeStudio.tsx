import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
// Added Trophy to the lucide-react imports
import { 
    Layout, Download, ChevronDown, 
    Loader2, Image as ImageIcon, Palette, Globe,
    Plus, Trash2, Check, Type, Award, Layers, User, MapPin, X,
    Settings2, ChevronUp, ImagePlus, MousePointer2, Move, Maximize2,
    Save, Wand2, FileText, Sparkles, RefreshCw, Trophy
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ResultStatus, ItemType, PerformanceType, Template, Participant } from '../types';

// --- Types ---
interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'dynamic';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    opacity?: number;
    dynamicType?: 'winner_name' | 'winner_team' | 'item_name' | 'category_name' | 'rank' | 'points' | 'place';
}

interface CanvasState {
    elements: CanvasElement[];
    bgColor: string;
    bgImage: string | null;
    width: number; // in px
    height: number; // in px
}

// --- Constants ---
const CANVAS_SIZE = 1080; // Standard High Res Square

const CreativeStudio: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const { state, addTemplate, deleteTemplate, updateSettings } = useFirebase();
    const [canvas, setCanvas] = useState<CanvasState>({
        elements: [],
        bgColor: '#ffffff',
        bgImage: null,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE
    });
    
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<'ELEMENTS' | 'TEMPLATES' | 'LAYERS'>('ELEMENTS');
    
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // --- Helpers ---
    const declaredItems = useMemo(() => 
        state?.results.filter(r => r.status === ResultStatus.DECLARED)
            .map(r => ({ id: r.itemId, name: state.items.find(i=>i.id===r.itemId)?.name || 'N/A', result: r })) || []
    , [state]);

    const currentResultData = useMemo(() => {
        if (!selectedItemId || !state) return null;
        const entry = declaredItems.find(i => i.id === selectedItemId);
        if (!entry) return null;
        const item = state.items.find(i => i.id === selectedItemId);
        const category = state.categories.find(c => c.id === item?.categoryId);
        return { item, category, result: entry.result };
    }, [selectedItemId, state, declaredItems]);

    const addElement = (type: CanvasElement['type'], extra: Partial<CanvasElement> = {}) => {
        const newEl: CanvasElement = {
            id: `el_${Date.now()}`,
            type,
            content: type === 'text' ? 'New Text' : '',
            x: 50, y: 50,
            width: type === 'text' ? 400 : 200,
            height: type === 'text' ? 100 : 200,
            fontSize: 48,
            color: '#000000',
            fontFamily: 'GlobalAutoFont',
            textAlign: 'center',
            ...extra
        };
        setCanvas(prev => ({ ...prev, elements: [...prev.elements, newEl] }));
        setSelectedElementId(newEl.id);
    };

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        setCanvas(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const deleteElement = (id: string) => {
        setCanvas(prev => ({ ...prev, elements: prev.elements.filter(el => el.id !== id) }));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    // --- Interaction ---
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.target === canvasRef.current) setSelectedElementId(null);
    };

    const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
        e.stopPropagation();
        setSelectedElementId(el.id);
        setIsDragging(true);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !selectedElementId || !canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scale = CANVAS_SIZE / canvasRect.width;
        
        const newX = (e.clientX - canvasRect.left - dragOffset.current.x) * scale;
        const newY = (e.clientY - canvasRect.top - dragOffset.current.y) * scale;
        
        updateElement(selectedElementId, { x: newX, y: newY });
    }, [isDragging, selectedElementId]);

    const handleGlobalMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [handleGlobalMouseMove, handleGlobalMouseUp]);

    // --- Logic: Populate Dynamic Data ---
    const resolveDynamicContent = (el: CanvasElement, winnerIndex: number = 0) => {
        if (!currentResultData) return el.dynamicType || 'No Data';
        const winnerEntry = currentResultData.result.winners.filter((w: any) => w.position > 0).sort((a:any,b:any)=>a.position-b.position)[winnerIndex];
        if (!winnerEntry) return '---';

        const participant = state?.participants.find(p => p.id === winnerEntry.participantId);
        const team = state?.teams.find(t => t.id === participant?.teamId);

        switch (el.dynamicType) {
            case 'winner_name': return participant?.name || '---';
            case 'winner_team': return team?.name || '---';
            case 'item_name': return currentResultData.item?.name || '---';
            case 'category_name': return currentResultData.category?.name || '---';
            case 'rank': return winnerEntry.position.toString();
            case 'points': return (winnerEntry.mark || 0).toString();
            case 'place': return participant?.place || '---';
            default: return el.content;
        }
    };

    const handleExport = async () => {
        if (!canvasRef.current) return;
        setIsExporting(true);
        setSelectedElementId(null);
        try {
            const element = canvasRef.current;
            const canvasImg = await html2canvas(element, { 
                scale: 2, 
                backgroundColor: null,
                useCORS: true,
                logging: false
            });
            const link = document.createElement('a');
            link.download = `artfest_poster_${Date.now()}.png`;
            link.href = canvasImg.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error(e);
            alert("Export failed.");
        } finally {
            setIsExporting(false);
        }
    };

    if (!state) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" /> Powering up Studio...</div>;

    const selectedElement = canvas.elements.find(el => el.id === selectedElementId);

    return (
        <div className="flex flex-col h-full bg-[#0F1210] overflow-hidden text-white">
            {/* Header */}
            <header className="shrink-0 h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg"><Sparkles size={20}/></div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Creative Studio</h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Posters & Certificates Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <select 
                        value={selectedItemId} 
                        onChange={e => setSelectedItemId(e.target.value)}
                        className="bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="">Choose Active Result</option>
                        {declaredItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isExporting ? <RefreshCw className="animate-spin" size={14}/> : <Download size={14}/>}
                        Export High-Res
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                <aside className="w-80 shrink-0 border-r border-white/5 bg-[#121412] flex flex-col overflow-hidden">
                    <div className="flex border-b border-white/5">
                        {['ELEMENTS', 'TEMPLATES', 'LAYERS'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-400 bg-indigo-400/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                        {activeTab === 'ELEMENTS' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Static Elements</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => addElement('text')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                            <Type size={20} className="text-indigo-400"/>
                                            <span className="text-[9px] font-black uppercase">Add Text</span>
                                        </button>
                                        <button onClick={() => addElement('image')} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                            <ImageIcon size={20} className="text-emerald-400"/>
                                            <span className="text-[9px] font-black uppercase">Add Image</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Result Fields</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { type: 'winner_name', label: 'Winner Name', icon: User },
                                            { type: 'winner_team', label: 'Team Name', icon: Award },
                                            { type: 'rank', label: 'Position', icon: Trophy },
                                            { type: 'item_name', label: 'Event Title', icon: Layers },
                                            { type: 'category_name', label: 'Level', icon: Globe },
                                            { type: 'place', label: 'Locality', icon: MapPin },
                                        ].map(field => (
                                            <button 
                                                key={field.type} 
                                                onClick={() => addElement('dynamic', { dynamicType: field.type as any, content: field.label, width: 600, height: 80 })} 
                                                className="flex flex-col items-center gap-2 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 hover:bg-indigo-500/10 transition-all"
                                            >
                                                <field.icon size={18} className="text-indigo-500"/>
                                                <span className="text-[8px] font-black uppercase text-center leading-none">{field.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Background Settings</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">Solid Color</span>
                                            <input type="color" value={canvas.bgColor} onChange={e => setCanvas(prev => ({...prev, bgColor: e.target.value}))} className="w-8 h-8 rounded border-none cursor-pointer" />
                                        </div>
                                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">
                                            <ImageIcon size={14}/> Set BG Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'LAYERS' && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                {canvas.elements.map((el, i) => (
                                    <div 
                                        key={el.id} 
                                        onClick={() => setSelectedElementId(el.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedElementId === el.id ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-zinc-500">{i+1}</span>
                                            <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[120px]">{el.content || el.dynamicType || el.type}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="text-white/40 hover:text-rose-500"><Trash2 size={14}/></button>
                                    </div>
                                )).reverse()}
                                {canvas.elements.length === 0 && <div className="py-20 text-center text-zinc-600 italic text-xs">No layers found</div>}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Canvas Workspace */}
                <main className="flex-1 bg-[#050605] relative overflow-hidden flex items-center justify-center p-12">
                    <div className="relative group/canvas shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                        <div 
                            ref={canvasRef}
                            onMouseDown={handleCanvasMouseDown}
                            className="relative bg-white text-black overflow-hidden shadow-2xl origin-center"
                            style={{ 
                                width: `${CANVAS_SIZE}px`, 
                                height: `${CANVAS_SIZE}px`, 
                                backgroundColor: canvas.bgColor,
                                transform: 'scale(0.5)' // Scaled for workspace display
                            }}
                        >
                            {canvas.bgImage && <img src={canvas.bgImage} className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none" />}
                            
                            {canvas.elements.map(el => {
                                const isSelected = selectedElementId === el.id;
                                const content = el.type === 'dynamic' ? resolveDynamicContent(el) : el.content;
                                
                                return (
                                    <div 
                                        key={el.id}
                                        onMouseDown={(e) => handleElementMouseDown(e, el)}
                                        className={`absolute select-none cursor-move transition-shadow ${isSelected ? 'ring-2 ring-indigo-500 z-50' : 'hover:ring-1 hover:ring-indigo-400/50'}`}
                                        style={{ 
                                            left: `${el.x}px`, 
                                            top: `${el.y}px`, 
                                            width: `${el.width}px`, 
                                            height: `${el.height}px`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                            color: el.color,
                                            fontSize: `${el.fontSize}px`,
                                            fontFamily: el.fontFamily,
                                            fontWeight: el.fontWeight,
                                            textAlign: el.textAlign,
                                            opacity: el.opacity,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {el.type === 'image' ? (
                                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                                                <ImageIcon className="text-zinc-400" size={el.width / 4} />
                                            </div>
                                        ) : content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Properties Panel */}
                <aside className="w-80 shrink-0 border-l border-white/5 bg-[#121412] p-6 overflow-y-auto custom-scrollbar">
                    {selectedElement ? (
                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Element Properties</h3>
                                <button onClick={() => setSelectedElementId(null)} className="p-1 text-zinc-500 hover:text-white"><X size={16}/></button>
                            </div>

                            <div className="space-y-6">
                                {selectedElement.type !== 'image' && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Text Content</label>
                                        <textarea 
                                            value={selectedElement.content} 
                                            onChange={e => updateElement(selectedElement.id, { content: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[80px]"
                                            disabled={selectedElement.type === 'dynamic'}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5">Font Size</label>
                                        <input type="number" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm font-bold text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5">Color</label>
                                        <input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Alignment</label>
                                    <div className="flex bg-white/5 rounded-xl p-1">
                                        {(['left', 'center', 'right'] as const).map(align => (
                                            <button 
                                                key={align} 
                                                onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                                                className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${selectedElement.textAlign === align ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                {align}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5">Width</label>
                                        <input type="number" value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm font-bold text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5">Height</label>
                                        <input type="number" value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm font-bold text-center" />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="w-full py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    Remove Element
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                            <MousePointer2 size={64} strokeWidth={1} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select an element to adjust properties</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default CreativeStudio;