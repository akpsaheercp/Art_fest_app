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

    const tables = reportContentRef.current.querySelectorAll('table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowText = (row as HTMLElement).innerText.toLowerCase();
            if (rowText.includes(searchTerm.toLowerCase())) {
                (row as HTMLElement).style.display = '';
            } else {
                (row as HTMLElement).style.display = 'none';
            }
        });
    });
  }, [searchTerm, isSearchable, content]);

  // Effect for setting up table sorting
  useEffect(() => {
    if (!isOpen || !reportContentRef.current) return;

    const tables = reportContentRef.current.querySelectorAll('table');
    if (tables.length === 0) return;

    const clickHandler = (e: Event) => {
      const header = e.currentTarget as HTMLElement;
      const table = header.closest('table');
      if (!table) return;

      const columnIndex = parseInt(header.dataset.columnIndex || '0', 10);
      const currentDirection = header.dataset.sortDirection;
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      
      // Reset other headers in the same table
      table.querySelectorAll('thead th[data-sortable="true"]').forEach(th => {
        if (th !== header) {
          delete (th as HTMLElement).dataset.sortDirection;
          const indicator = th.querySelector('.sort-indicator');
          if (indicator) indicator.innerHTML = ' \u2195';
        }
      });

      header.dataset.sortDirection = newDirection;
      const indicator = header.querySelector('.sort-indicator');
      if (indicator) {
        indicator.innerHTML = newDirection === 'asc' ? ' \u2191' : ' \u2193';
      }

      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      const sortedRows = rows.sort((a, b) => {
        const aVal = a.cells[columnIndex]?.innerText || '';
        const bVal = b.cells[columnIndex]?.innerText || '';
        const aNum = parseFloat(aVal.replace(/,/g, ''));
        const bNum = parseFloat(bVal.replace(/,/g, ''));

        let comparison = 0;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum;
        } else {
          comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
        }
        
        return newDirection === 'asc' ? comparison : -comparison;
      });

      sortedRows.forEach(row => tbody.appendChild(row));
    };
    
    const headers: NodeListOf<HTMLElement>[] = [];
    tables.forEach(table => {
      // FIX: Replaced generic type argument with a type assertion (`as`) to avoid "Untyped function calls may not accept type arguments" error.
      const tableHeaders = table.querySelectorAll('thead th[data-sortable="true"]') as NodeListOf<HTMLElement>;
      tableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        if (!header.querySelector('.sort-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.style.display = 'inline-block';
            indicator.innerHTML = ' \u2195'; // Up-down arrow
            header.appendChild(indicator);
        }
        header.addEventListener('click', clickHandler);
      });
      headers.push(tableHeaders);
    });
    
    return () => {
      headers.forEach(tableHeaders => {
          tableHeaders.forEach(header => {
              header.removeEventListener('click', clickHandler);
          });
      });
    };
  }, [isOpen, content]);


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
          <style> body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } .sort-indicator { display: none !important; } </style>
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
                        placeholder={`Find in ${title}...`}
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
      .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; }
    </style>
  `;

  const generateParticipantsList = () => {
    let html = `${getStyles()}<h3>All Participants</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Chest No.</th><th data-sortable="true" data-column-index="2">Name</th><th data-sortable="true" data-column-index="3">Team</th><th data-sortable="true" data-column-index="4">Category</th></tr></thead><tbody>`;
    [...state.participants].sort((a,b) => a.chestNumber.localeCompare(b.chestNumber)).forEach((p, index) => {
        html += `<tr><td>${index + 1}</td><td>${p.chestNumber}</td><td>${p.name}</td><td>${getTeamName(p.teamId)}</td><td>${getCategoryName(p.categoryId)}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  };
  
  const generateItemsList = () => {
    let html = `${getStyles()}<h3>All Items</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Name</th><th data-sortable="true" data-column-index="2">Category</th><th data-sortable="true" data-column-index="3">Type</th><th data-sortable="true" data-column-index="4">Points (1/2/3)</th></tr></thead><tbody>`;
    state.items.forEach((item, index) => {
        html += `<tr><td>${index + 1}</td><td>${item.name}</td><td>${getCategoryName(item.categoryId)}</td><td>${item.type}</td><td>${item.points.first}/${item.points.second}/${item.points.third}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  };

  const generateSchedule = () => {
    let html = `${getStyles()}<h3>Full Schedule</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Date</th><th data-sortable="true" data-column-index="2">Time</th><th data-sortable="true" data-column-index="3">Item</th><th data-sortable="true" data-column-index="4">Category</th><th data-sortable="true" data-column-index="5">Stage</th></tr></thead><tbody>`;
    state.schedule.forEach((event, index) => {
        const item = state.items.find(i => i.id === event.itemId);
        const category = state.categories.find(c => c.id === event.categoryId);
        html += `<tr><td>${index + 1}</td><td>${event.date}</td><td>${event.time}</td><td>${item?.name || 'N/A'}</td><td>${category?.name || 'N/A'}</td><td>${event.stage}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  }

  const generateResults = () => {
    let html = `${getStyles()}`;
    state.results.forEach((result, index) => {
      const item = state.items.find(i => i.id === result.itemId);
      if (!item) return;
      html += `<div class="${index > 0 ? 'page-break-before-always' : ''}">
        <h3>Results: ${item.name} (${getCategoryName(result.categoryId)})</h3>
        <table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Position</th><th data-sortable="true" data-column-index="2">Name</th><th data-sortable="true" data-column-index="3">Team</th><th data-sortable="true" data-column-index="4">Mark</th><th data-sortable="true" data-column-index="5">Grade</th></tr></thead><tbody>`;
      result.winners.sort((a,b) => a.position - b.position).forEach((winner, winnerIndex) => {
        const p = getParticipant(winner.participantId);
        const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
        const grade = gradeConfig.find(g => g.id === winner.gradeId);
        html += `<tr><td>${winnerIndex + 1}</td><td>${winner.position}</td><td>${p?.name || 'N/A'}</td><td>${getTeamName(p?.teamId || '')}</td><td>${winner.mark}</td><td>${grade?.name || '-'}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    });
    return html;
  }
  
  const generateItemParticipants = () => {
    let html = `${getStyles()}`;
    state.items.forEach((item, index) => {
        html += `<div class="${index > 0 ? 'page-break-before-always' : ''}">`;
        html += `<h3 class="mb-4 font-bold text-xl">Item: ${item.name} (${getCategoryName(item.categoryId)})</h3>`;
        const participantsInItem = state.participants.filter(p => p.itemIds.includes(item.id));

        if (participantsInItem.length === 0) {
            html += `<p>No participants registered for this item.</p></div>`;
            return;
        }

        html += `<table>
            <thead>
                <tr>
                    <th data-sortable="false">Sl.No</th>
                    <th data-sortable="true" data-column-index="1">Chest No.</th>
                    <th data-sortable="true" data-column-index="2">Name</th>
                    <th data-sortable="true" data-column-index="3">Code Letter</th>
                    <th data-sortable="false">Signature</th>
                </tr>
            </thead>
            <tbody>`;

        participantsInItem
            .sort((a, b) => a.chestNumber.localeCompare(b.chestNumber))
            .forEach((p, pIndex) => {
                const tabulationEntry = state.tabulation.find(t => t.itemId === item.id && t.participantId === p.id);
                html += `<tr>
                    <td>${pIndex + 1}</td>
                    <td>${p.chestNumber}</td>
                    <td>${p.name}</td>
                    <td>${tabulationEntry?.codeLetter || ''}</td>
                    <td style="width: 200px;"></td>
                </tr>`;
            });

        html += `</tbody></table></div>`;
    });
    return html;
  };
  
  const reports = [
    { id: 'participants', name: 'All Participants List', generator: generateParticipantsList, isSearchable: true },
    { id: 'items', name: 'All Items List', generator: generateItemsList, isSearchable: true },
    { id: 'item_participants', name: 'Item-wise Participants', generator: generateItemParticipants, isSearchable: true },
    { id: 'schedule', name: 'Full Schedule', generator: generateSchedule, isSearchable: true },
    { id: 'results', name: 'Item-wise Results', generator: generateResults, isSearchable: true },
  ];

  const handleGenerateReport = (report: typeof reports[0]) => {
    const content = report.generator();
    setReportContent({ title: report.name, content, isSearchable: report.isSearchable });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Reports</h2>
      <Card title="Available Reports">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleGenerateReport(report)}
              className="p-6 text-left bg-zinc-100 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">{report.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Click to generate and view this report.</p>
            </button>
          ))}
        </div>
      </Card>
      
      <ReportViewer
        isOpen={!!reportContent}
        onClose={() => setReportContent(null)}
        title={reportContent?.title || ''}
        content={reportContent?.content || ''}
        isSearchable={reportContent?.isSearchable || false}
      />
    </div>
  );
};

export default ReportsPage;