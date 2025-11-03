import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAppState } from '../hooks/useAppState';
import { X, Printer } from 'lucide-react';

interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isSearchable?: boolean;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ isOpen, onClose, title, content, isSearchable = false }) => {
  const { state } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
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
      const tableHeaders = table.querySelectorAll('thead th[data-sortable="true"]') as NodeListOf<HTMLElement>;
      tableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        if (!header.querySelector('.sort-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.style.display = 'inline-block';
            indicator.innerHTML = ' \u2195';
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
          <style> 
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 12px; line-height: 1.3; }
              .page-break-before-always { page-break-before: always; }
              th, td { padding: 4px 6px !important; }
              table { margin-bottom: 0.75rem !important; }
              h1,h2,h3,h4 { margin-bottom: 0.5rem !important; }
            }
            body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } 
            .sort-indicator { display: none !important; } 
            .no-wrap { white-space: nowrap; }
          </style>
        </head>
        <body>
          <div style="padding: 1rem;">
            <div style="text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
              <h1 style="font-size: 1.75rem; font-weight: bold; margin:0;">${state.settings.heading}</h1>
              <p style="font-size: 1rem; color: #555; margin:0; margin-top: 0.25rem;">${state.settings.description}</p>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 600; color: #333; text-align: center; margin-bottom: 1.5rem;">${title}</h2>
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
                        className="w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            ) : <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>}

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                aria-label="Export report"
              >
                <Printer className="h-4 w-4" /> <span>Export</span>
              </button>
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

export default ReportViewer;
