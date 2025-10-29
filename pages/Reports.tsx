
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { X, Printer, ChevronDown, FileDown } from 'lucide-react';
import { ItemType } from '../types';

// --- ReportViewer Modal Component ---
interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isSearchable: boolean;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ isOpen, onClose, title, content, isSearchable }) => {
  const { state } = useAppState();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setSearchTerm(''); // Reset search on open
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    if (isActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsOpen]);

  useEffect(() => {
    if (!isSearchable || !reportContentRef.current) return;

    const table = reportContentRef.current.querySelector('table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const rowText = (row as HTMLElement).innerText.toLowerCase();
      if (rowText.includes(searchTerm.toLowerCase())) {
        (row as HTMLElement).style.display = '';
      } else {
        (row as HTMLElement).style.display = 'none';
      }
    });
  }, [searchTerm, isSearchable, content]);


  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    
    if (!printWindow) {
        alert('Could not open print window. Please ensure pop-up blockers are disabled for this site.');
        return;
    }
    
    const contentToPrint = reportContentRef.current?.innerHTML || content;

    const reportHtml = `
      <html>
        <head>
          <title>${state.settings.heading} - ${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: { extend: { colors: { teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' }, zinc: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' }, }, }, },
            };
          </script>
          <style> body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } </style>
        </head>
        <body>
          <div class="p-6">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold">${state.settings.heading}</h1>
              <h2 class="text-2xl font-semibold text-zinc-700">${title}</h2>
            </div>
            <div>
              ${contentToPrint}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  if (!isOpen) {
    return null;
  }
  
  const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="relative flex flex-col w-full h-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 gap-4">
             {isSearchable ? (
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search in report..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                </div>
            ) : <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>}

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setIsActionsOpen(prev => !prev)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                  aria-haspopup="true" aria-expanded={isActionsOpen} aria-label="Export options"
                >
                  <Printer className="h-4 w-4" /> <span>Export</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isActionsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-10 border border-zinc-200 dark:border-zinc-700">
                    <button onClick={() => { handlePrint(); setIsActionsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <Printer className="h-4 w-4" /> <span>Print</span>
                    </button>
                    <button onClick={() => { handlePrint(); setIsActionsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <FileDown className="h-4 w-4" /> <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Close report viewer">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6" ref={reportContentRef}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};


// --- Reports Page ---
const ReportsPage: React.FC = () => {
  const { state } = useAppState();
  const [reportContent, setReportContent] = useState<{ title: string; content: string; isSearchable: boolean } | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

  const getTeamName = (id: string) => state.teams.find(t => t.id === id)?.name || 'N/A';
  const getCategoryName = (id: string) => state.categories.find(c => c.id === id)?.name || 'N/A';
  const getParticipant = (id: string) => state.participants.find(p => p.id === id);

  const getStyles = () => `
    <style>
      .grid { display: grid; gap: 1rem; } .grid-cols-2 { grid-template-columns: repeat(2, 1fr); } .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .id-card { border: 1px solid #ccc !important; page-break-inside: avoid; padding: 1rem; text-align: center; height: 12rem; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } thead { background-color: #f2f2f2; } th { font-weight: bold; }
      .page-break-before-always { page-break-before: always; } .font-bold { font-weight: 700; } .font-medium { font-weight: 500; }
      .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-sm { font-size: 0.875rem; } .text-xs { font-size: 0.75rem; }
      .mb-2 { margin-bottom: 0.5rem; } .mb-8 { margin-bottom: 2rem; } .mt-1 { margin-top: 0.25rem; } .mt-4 { margin-top: 1rem; } .text-center { text-align: center; }
    </style>
  `;

  const generateReport = (title: string, content: string, isSearchable: boolean = false) => {
    setReportContent({ title, content: getStyles() + content, isSearchable });
  };
  
  const handleGenerateIdCards = (returnOnly = false) => {
    const content = `<div class="grid grid-cols-2 md:grid-cols-3 gap-4">${state.participants.map(p => `<div class="id-card"><h3 class="text-lg font-bold">${p.name}</h3><p class="text-sm mt-1">Chest No: <strong class="font-bold">${p.chestNumber}</strong></p><p class="text-sm">Team: <strong class="font-bold">${getTeamName(p.teamId)}</strong></p><p class="mt-4 text-xs font-semibold">${state.settings.heading}</p></div>`).join('')}</div>`;
    const title = 'Participant ID Cards';
    if (returnOnly) return { title, content };
    generateReport(title, content);
  };

  const handleGenerateParticipantsList = (returnOnly = false) => {
    const content = `<table><thead><tr><th>Chest No.</th><th>Name</th><th>Team</th><th>Category</th></tr></thead><tbody>${state.participants.sort((a,b) => a.chestNumber.localeCompare(b.chestNumber)).map(p => `<tr><td>${p.chestNumber}</td><td class="font-medium">${p.name}</td><td>${getTeamName(p.teamId)}</td><td>${getCategoryName(p.categoryId)}</td></tr>`).join('')}</tbody></table>`;
    const title = 'Participants List';
    if (returnOnly) return { title, content };
    generateReport(title, content, true);
  };

  const handleGenerateCodeLetterList = (returnOnly = false) => {
    let content = '';
    state.items.forEach(item => {
      const participantsInItem = state.participants.filter(p => p.itemIds.includes(item.id));
      if (participantsInItem.length === 0) return;
      content += `<div class="mb-8 page-break-before-always"><h3 class="text-xl font-bold mb-2">${item.name} - ${getCategoryName(item.categoryId)}</h3><table><thead><tr><th>Chest No.</th><th>Name</th><th>Team</th><th>Code Letter</th></tr></thead><tbody>${participantsInItem.map(p => { const tabulationEntry = state.tabulation.find(t => t.participantId === p.id && t.itemId === item.id); return `<tr><td>${p.chestNumber}</td><td class="font-medium">${p.name}</td><td>${getTeamName(p.teamId)}</td><td class="font-bold">${tabulationEntry?.codeLetter || 'N/A'}</td></tr>`; }).join('')}</tbody></table></div>`;
    });
    const title = 'Code Letter List';
    if (returnOnly) return { title, content };
    generateReport(title, content, true);
  };

  const handleGenerateCount = (returnOnly = false) => {
    const content = `<table><thead><tr><th>Item Name</th><th>Category</th><th class="text-center">Participant Count</th></tr></thead><tbody>${state.items.map(item => `<tr><td class="font-medium">${item.name}</td><td>${getCategoryName(item.categoryId)}</td><td class="text-center font-bold">${state.participants.filter(p => p.itemIds.includes(item.id)).length}</td></tr>`).join('')}</tbody></table>`;
    const title = 'Participant Count per Item';
    if (returnOnly) return { title, content };
    generateReport(title, content, true);
  };

  const handleGenerateWinnersList = (returnOnly = false) => {
    let content = '';
    const declaredResults = state.results.filter(r => r.declared);
    if (declaredResults.length === 0) { content = '<p class="text-center">No results have been declared yet.</p>'; } else {
      declaredResults.forEach(result => {
        const item = state.items.find(i => i.id === result.itemId); if (!item) return;
        content += `<div class="mb-8 page-break-before-always"><h3 class="text-xl font-bold mb-2">${item.name} - ${getCategoryName(result.categoryId)}</h3><table><thead><tr><th>Position</th><th>Name</th><th>Team</th><th>Mark</th></tr></thead><tbody>${result.winners.sort((a,b) => a.position - b.position).map(winner => { const participant = getParticipant(winner.participantId); return `<tr><td class="font-bold">${winner.position}</td><td class="font-medium">${participant?.name || 'N/A'}</td><td>${getTeamName(participant?.teamId || '')}</td><td>${winner.mark}</td></tr>`; }).join('')}</tbody></table></div>`;
      });
    }
    const title = 'Winners List';
    if (returnOnly) return { title, content };
    generateReport(title, content, true);
  };
  
  const reportGenerators: { [key: string]: { title: string; description: string; handler: (returnOnly?: boolean) => any; } } = {
    'id-cards': { title: 'ID Cards', description: 'Generate printable ID cards for each participant.', handler: handleGenerateIdCards },
    'participants-list': { title: 'Participants List', description: 'View and print a list of all participants.', handler: handleGenerateParticipantsList },
    'code-letter-list': { title: 'Code Letter List', description: 'Detailed list for each item with names and teams.', handler: handleGenerateCodeLetterList },
    'participant-count': { title: 'Participant Count per Item', description: 'Total number of participants for each item.', handler: handleGenerateCount },
    'winners-list': { title: 'Winners List', description: 'A complete list of all winners.', handler: handleGenerateWinnersList },
  };

  const handleSelectReport = (id: string, isSelected: boolean) => {
    setSelectedReports(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleBatchPrint = () => {
    let combinedContent = '';
    Array.from(selectedReports).forEach(id => {
      const generator = reportGenerators[id]?.handler;
      if (generator) {
        const { title, content } = generator(true);
        combinedContent += `<div class="page-break-before-always"><h2 class="text-2xl font-bold text-center mb-4">${title}</h2>${content}</div>`;
      }
    });

    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (!printWindow) { alert('Could not open print window.'); return; }
    printWindow.document.write(`<html><head><title>Batch Report</title><script src="https://cdn.tailwindcss.com"></script>${getStyles()}</head><body><div class="p-6">${combinedContent}</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
  };


  // --- CSV Export Logic ---
  const exportToCsv = (filename: string, data: any[]) => {
    if (data.length === 0) { alert("No data available to export."); return; }
    const headers = Object.keys(data[0]);
    const csvContent = [ headers.join(','), ...data.map(row => headers.map(header => { let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]); if (cell.includes(',')) { cell = `"${cell}"`; } return cell; }).join(',')) ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url); link.setAttribute("download", filename); link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportParticipants = () => {
    const data = state.participants.map(p => ({ 'Chest Number': p.chestNumber, 'Name': p.name, 'Team': getTeamName(p.teamId), 'Category': getCategoryName(p.categoryId), 'Items': p.itemIds.map(id => state.items.find(i => i.id === id)?.name || '').join('; ') }));
    exportToCsv('participants.csv', data);
  };

  const handleExportResults = () => {
    const data: any[] = [];
    const getGradeName = (gradeId: string | null, itemType: ItemType) => { if (!gradeId) return 'N/A'; const gradeConfig = itemType === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group; const grade = gradeConfig.find(g => g.id === gradeId); return grade ? grade.name : 'N/A'; };
    state.results.forEach(result => {
      const item = state.items.find(i => i.id === result.itemId); if (!item || !result.declared) return;
      const entries = state.tabulation.filter(t => t.itemId === result.itemId && t.categoryId === result.categoryId);
      entries.forEach(entry => {
        const participant = getParticipant(entry.participantId); if (!participant) return;
        data.push({ 'Item': item.name, 'Category': getCategoryName(result.categoryId), 'Chest Number': participant.chestNumber, 'Name': participant.name, 'Team': getTeamName(participant.teamId), 'Mark': entry.mark ?? '', 'Position': entry.position ?? '', 'Grade': getGradeName(entry.gradeId, item.type) });
      });
    });
    exportToCsv('full_results.csv', data.sort((a, b) => a.Item.localeCompare(b.Item) || a.Position - b.Position));
  };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Reports</h2>
      
      {selectedReports.size > 0 && (
          <Card title="Batch Actions">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{selectedReports.size} report(s) selected. Print or download them as a single document.</p>
              <button onClick={handleBatchPrint} className="w-full px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Print / Save as PDF Selected</button>
          </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(reportGenerators).map(([id, { title, description, handler }]) => (
            <Card title={title} key={id} className="relative">
                <div className="absolute top-4 right-4">
                    <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-zinc-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                        onChange={(e) => handleSelectReport(id, e.target.checked)}
                        checked={selectedReports.has(id)}
                        aria-label={`Select ${title} report`}
                    />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>
                <button onClick={() => handler()} className="w-full px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">View/Print</button>
            </Card>
        ))}

        <Card title="Data Export">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Download your data in CSV format for use in spreadsheets.</p>
             <div className="flex flex-col gap-2">
                <button onClick={handleExportParticipants} className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">Export Participants (CSV)</button>
                <button onClick={handleExportResults} className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm">Export Full Results (CSV)</button>
             </div>
        </Card>
      </div>

       {reportContent && (
        <ReportViewer
          isOpen={!!reportContent}
          onClose={() => setReportContent(null)}
          title={reportContent.title}
          content={reportContent.content}
          isSearchable={reportContent.isSearchable}
        />
      )}
    </div>
  );
};

export default ReportsPage;
