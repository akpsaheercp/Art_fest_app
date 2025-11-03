import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../components/Card';
import { useAppState } from '../hooks/useAppState';
import { X, Printer, ChevronDown, FileDown } from 'lucide-react';
import { ItemType, ResultStatus } from '../types';
import ReportViewer from '../components/ReportViewer';


interface ReportFilters {
  teamId: string;
  categoryId: string;
}

// --- Reports Page ---
const ReportsPage: React.FC = () => {
  const { state } = useAppState();
  const [reportContent, setReportContent] = useState<{ title: string; content: string; isSearchable: boolean } | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({ teamId: '', categoryId: '' });

  const getTeamName = (id: string) => state.teams.find(t => t.id === id)?.name || 'N/A';
  const getCategoryName = (id: string) => state.categories.find(c => c.id === id)?.name || 'N/A';
  const getParticipant = (id: string) => state.participants.find(p => p.id === id);
  
  const reportCounts = useMemo(() => {
    const participantsCount = state.participants.filter(p => 
        (!filters.teamId || p.teamId === filters.teamId) && 
        (!filters.categoryId || p.categoryId === filters.categoryId)
    ).length;

    const itemsCount = state.items.filter(item => 
        !filters.categoryId || item.categoryId === filters.categoryId
    ).length;

    const itemParticipantsCount = state.items.filter(item => !filters.categoryId || item.categoryId === filters.categoryId)
        .reduce((acc, item) => {
            const count = state.participants.filter(p => 
                p.itemIds.includes(item.id) && 
                (!filters.teamId || p.teamId === filters.teamId)
            ).length;
            return acc + count;
        }, 0);
    
    const scheduleCount = state.schedule.filter(event => 
        !filters.categoryId || event.categoryId === filters.categoryId
    ).length;
    
    const resultsCount = state.results.filter(result => {
        if (result.status !== ResultStatus.DECLARED) return false;
        const categoryMatch = !filters.categoryId || result.categoryId === filters.categoryId;
        if (!categoryMatch) return false;

        if (filters.teamId) {
            return result.winners.some(winner => {
                const participant = getParticipant(winner.participantId);
                return participant && participant.teamId === filters.teamId;
            });
        }
        return true;
    }).length;

    return {
        participants: participantsCount,
        items: itemsCount,
        item_participants: itemParticipantsCount,
        schedule: scheduleCount,
        results: resultsCount,
    };
  }, [state.participants, state.items, state.schedule, state.results, filters]);


  const getStyles = () => `
    <style>
      .grid { display: grid; gap: 1rem; } .grid-cols-2 { grid-template-columns: repeat(2, 1fr); } .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .id-card { border: 1px solid #ccc !important; page-break-inside: avoid; padding: 1rem; text-align: center; height: 12rem; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 14px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } thead { background-color: #f2f2f2; } th { font-weight: bold; }
      .page-break-before-always { page-break-before: always; } .font-bold { font-weight: 700; } .font-medium { font-weight: 500; }
      .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-sm { font-size: 0.875rem; } .text-xs { font-size: 0.75rem; }
      .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
      .no-wrap { white-space: nowrap; }
    </style>
  `;

  const generateParticipantsList = (filters: ReportFilters) => {
    let html = `${getStyles()}<h3>All Participants</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Chest No.</th><th data-sortable="true" data-column-index="2" class="no-wrap">Name</th><th data-sortable="true" data-column-index="3">Team</th><th data-sortable="true" data-column-index="4">Category</th></tr></thead><tbody>`;
    const filteredParticipants = state.participants.filter(p => {
        const teamMatch = filters.teamId ? p.teamId === filters.teamId : true;
        const categoryMatch = filters.categoryId ? p.categoryId === filters.categoryId : true;
        return teamMatch && categoryMatch;
    });

    [...filteredParticipants].sort((a,b) => a.chestNumber.localeCompare(b.chestNumber)).forEach((p, index) => {
        html += `<tr><td>${index + 1}</td><td>${p.chestNumber}</td><td class="no-wrap">${p.name}</td><td>${getTeamName(p.teamId)}</td><td>${getCategoryName(p.categoryId)}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  };
  
  const generateItemsList = (filters: ReportFilters) => {
    let html = `${getStyles()}<h3>All Items</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1" class="no-wrap">Name</th><th data-sortable="true" data-column-index="2">Category</th><th data-sortable="true" data-column-index="3">Type</th><th data-sortable="true" data-column-index="4">Points (1/2/3)</th></tr></thead><tbody>`;
    const filteredItems = state.items.filter(item => filters.categoryId ? item.categoryId === filters.categoryId : true);
    
    filteredItems.forEach((item, index) => {
        html += `<tr><td>${index + 1}</td><td class="no-wrap">${item.name}</td><td>${getCategoryName(item.categoryId)}</td><td>${item.type}</td><td>${item.points.first}/${item.points.second}/${item.points.third}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  };

  const generateSchedule = (filters: ReportFilters) => {
    let html = `${getStyles()}<h3>Full Schedule</h3><table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Date</th><th data-sortable="true" data-column-index="2">Time</th><th data-sortable="true" data-column-index="3" class="no-wrap">Item</th><th data-sortable="true" data-column-index="4">Category</th><th data-sortable="true" data-column-index="5">Stage</th></tr></thead><tbody>`;
    const filteredSchedule = state.schedule.filter(event => filters.categoryId ? event.categoryId === filters.categoryId : true);
    
    filteredSchedule.forEach((event, index) => {
        const item = state.items.find(i => i.id === event.itemId);
        const category = state.categories.find(c => c.id === event.categoryId);
        html += `<tr><td>${index + 1}</td><td>${event.date}</td><td>${event.time}</td><td class="no-wrap">${item?.name || 'N/A'}</td><td>${category?.name || 'N/A'}</td><td>${event.stage}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
  }
  
  const getFilteredResults = (filters: ReportFilters) => {
    return state.results.filter(result => {
        if (result.status !== ResultStatus.DECLARED) return false;
        
        const categoryMatch = !filters.categoryId || result.categoryId === filters.categoryId;
        if (!categoryMatch) return false;

        if (filters.teamId) {
            return result.winners.some(winner => {
                const participant = getParticipant(winner.participantId);
                return participant && participant.teamId === filters.teamId;
            });
        }
        return true;
    });
  };

  const generateResultsPaginated = (filters: ReportFilters) => {
    let html = `${getStyles()}`;
    const filteredResults = getFilteredResults(filters);
    
    if (filteredResults.length === 0) return `${getStyles()}<p>No declared results match the selected filters.</p>`;
    
    filteredResults.forEach((result, index) => {
      const item = state.items.find(i => i.id === result.itemId);
      if (!item) return;
      html += `<div class="${index > 0 ? 'page-break-before-always' : ''}">
        <h3 class="mb-4 font-bold text-xl">Results: ${item.name} (${getCategoryName(result.categoryId)})</h3>
        <table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Position</th><th data-sortable="true" data-column-index="2" class="no-wrap">Name</th><th data-sortable="true" data-column-index="3">Team</th><th data-sortable="true" data-column-index="4">Mark</th><th data-sortable="true" data-column-index="5">Grade</th></tr></thead><tbody>`;
      result.winners.sort((a,b) => a.position - b.position).forEach((winner, winnerIndex) => {
        const p = getParticipant(winner.participantId);
        const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
        const grade = gradeConfig.find(g => g.id === winner.gradeId);
        html += `<tr><td>${winnerIndex + 1}</td><td>${winner.position}</td><td class="no-wrap">${p?.name || 'N/A'}</td><td>${getTeamName(p?.teamId || '')}</td><td>${winner.mark}</td><td>${grade?.name || '-'}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    });
    return html;
  }

  const generateResultsContinuous = (filters: ReportFilters) => {
    let html = `${getStyles()}`;
    const filteredResults = getFilteredResults(filters);

    if (filteredResults.length === 0) return `${getStyles()}<p>No declared results match the selected filters.</p>`;

    html += `<h3>Declared Results Summary</h3>`;
    filteredResults.forEach((result) => {
      const item = state.items.find(i => i.id === result.itemId);
      if (!item) return;
      html += `<div class="mb-6">
        <h4 class="font-bold text-lg mb-2">${item.name} (${getCategoryName(result.categoryId)})</h4>
        <table><thead><tr><th data-sortable="false">Sl.No</th><th data-sortable="true" data-column-index="1">Position</th><th data-sortable="true" data-column-index="2" class="no-wrap">Name</th><th data-sortable="true" data-column-index="3">Team</th><th data-sortable="true" data-column-index="4">Mark</th><th data-sortable="true" data-column-index="5">Grade</th></tr></thead><tbody>`;
      result.winners.sort((a,b) => a.position - b.position).forEach((winner, winnerIndex) => {
        const p = getParticipant(winner.participantId);
        const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
        const grade = gradeConfig.find(g => g.id === winner.gradeId);
        html += `<tr><td>${winnerIndex + 1}</td><td>${winner.position}</td><td class="no-wrap">${p?.name || 'N/A'}</td><td>${getTeamName(p?.teamId || '')}</td><td>${winner.mark}</td><td>${grade?.name || '-'}</td></tr>`;
      });
      html += `</tbody></table></div>`;
    });
    return html;
  }
  
  const generateItemParticipantsPaginated = (filters: ReportFilters) => {
    let html = `${getStyles()}`;
    const filteredItems = state.items.filter(item => filters.categoryId ? item.categoryId === filters.categoryId : true);
    
    filteredItems.forEach((item, index) => {
        html += `<div class="${index > 0 ? 'page-break-before-always' : ''}">`;
        html += `<h3 class="mb-4 font-bold text-xl">Item: ${item.name} (${getCategoryName(item.categoryId)})</h3>`;
        
        const participantsInItem = state.participants
            .filter(p => p.itemIds.includes(item.id))
            .filter(p => filters.teamId ? p.teamId === filters.teamId : true);

        if (participantsInItem.length === 0) {
            html += `<p>No participants registered for this item.</p></div>`;
            return;
        }

        html += `<table>
            <thead>
                <tr>
                    <th data-sortable="false">Sl.No</th>
                    <th data-sortable="true" data-column-index="1">Chest No.</th>
                    <th data-sortable="true" data-column-index="2" class="no-wrap">Name</th>
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
                    <td class="no-wrap">${p.name}</td>
                    <td>${tabulationEntry?.codeLetter || ''}</td>
                    <td style="width: 200px;"></td>
                </tr>`;
            });

        html += `</tbody></table></div>`;
    });
    return html;
  };

  const generateItemParticipantsContinuous = (filters: ReportFilters) => {
    let html = `${getStyles()}`;
    const filteredItems = state.items.filter(item => filters.categoryId ? item.categoryId === filters.categoryId : true);

    html += `<h3>Item-wise Participants</h3>
    <table>
        <thead>
            <tr>
                <th data-sortable="false">Sl.No</th>
                <th data-sortable="true" data-column-index="1" class="no-wrap">Item</th>
                <th data-sortable="true" data-column-index="2">Chest No.</th>
                <th data-sortable="true" data-column-index="3" class="no-wrap">Name</th>
                <th data-sortable="true" data-column-index="4">Code Letter</th>
                <th data-sortable="false">Signature</th>
            </tr>
        </thead>
        <tbody>`;
    
    let overallIndex = 0;
    filteredItems.forEach((item) => {
        const participantsInItem = state.participants
            .filter(p => p.itemIds.includes(item.id))
            .filter(p => filters.teamId ? p.teamId === filters.teamId : true)
            .sort((a, b) => a.chestNumber.localeCompare(b.chestNumber));

        participantsInItem.forEach((p) => {
            overallIndex++;
            const tabulationEntry = state.tabulation.find(t => t.itemId === item.id && t.participantId === p.id);
            html += `<tr>
                <td>${overallIndex}</td>
                <td class="no-wrap">${item.name}</td>
                <td>${p.chestNumber}</td>
                <td class="no-wrap">${p.name}</td>
                <td>${tabulationEntry?.codeLetter || ''}</td>
                <td style="width: 200px;"></td>
            </tr>`;
        });
    });

    html += `</tbody></table>`;
    return html;
  };
  
  const reports = [
    { id: 'participants', name: 'All Participants List', generator: generateParticipantsList, isSearchable: true, count: reportCounts.participants },
    { id: 'items', name: 'All Items List', generator: generateItemsList, isSearchable: true, count: reportCounts.items },
    { id: 'item_participants_paginated', name: 'Item-wise Participants (Paginated)', generator: generateItemParticipantsPaginated, isSearchable: true, count: reportCounts.item_participants },
    { id: 'item_participants_continuous', name: 'Item-wise Participants (Continuous)', generator: generateItemParticipantsContinuous, isSearchable: true, count: reportCounts.item_participants },
    { id: 'schedule', name: 'Full Schedule', generator: generateSchedule, isSearchable: true, count: reportCounts.schedule },
    { id: 'results_paginated', name: 'Declared Results (Paginated)', generator: generateResultsPaginated, isSearchable: true, count: reportCounts.results },
    { id: 'results_continuous', name: 'Declared Results (Continuous)', generator: generateResultsContinuous, isSearchable: true, count: reportCounts.results },
  ];

  const handleGenerateReport = (report: typeof reports[0]) => {
    const content = report.generator(filters);
    setReportContent({ title: report.name, content, isSearchable: report.isSearchable });
  };
  
  const inputClasses = "block w-full rounded-md border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm shadow-sm placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">Reports</h2>
      
      <Card title="Report Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Filter by Team</label>
                  <select value={filters.teamId} onChange={e => setFilters({...filters, teamId: e.target.value})} className={inputClasses}>
                      <option value="">All Teams</option>
                      {state.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Filter by Category</label>
                  <select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})} className={inputClasses}>
                      <option value="">All Categories</option>
                      {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
          </div>
      </Card>
      
      <Card title="Available Reports">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleGenerateReport(report)}
              className="p-4 text-left bg-zinc-100 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 mr-2">{report.name}</h3>
                {report.count > 0 && (
                    <span className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full">{report.count}</span>
                )}
              </div>
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