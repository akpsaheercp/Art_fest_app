
import { Settings, Users, ClipboardList, Medal, Hash, LayoutDashboard, UserPlus, Calendar, Edit3, BarChart2, FileText, Home } from 'lucide-react';

export const TABS = {
  DASHBOARD: 'Dashboard',
  GENERAL_SETTINGS: 'General Settings',
  TEAMS_CATEGORIES: 'Teams & Categories',
  ITEMS: 'Items',
  GRADE_POINTS: 'Grade Points',
  CODE_LETTERS: 'Code Letters',
  DATA_ENTRY: "Participant's Data Entry",
  SCHEDULE: 'Schedule',
  TABULATION: 'Tabulation',
  POINTS: 'Points',
  REPORTS: 'Reports',
};

export const INITIALIZATION_SUB_PAGE_ICONS = {
    'General Settings': Settings,
    'Teams & Categories': Users,
    'Items': ClipboardList,
    'Grade Points': Medal,
    'Code Letters': Hash,
};


export const SIDEBAR_GROUPS = [
    {
        title: 'Overview',
        tabs: [TABS.DASHBOARD]
    },
    {
        title: 'Management',
        tabs: [
            TABS.GENERAL_SETTINGS,
            TABS.TEAMS_CATEGORIES,
            TABS.ITEMS,
            TABS.GRADE_POINTS,
            TABS.CODE_LETTERS,
            TABS.DATA_ENTRY,
            TABS.SCHEDULE,
            TABS.TABULATION
        ]
    },
    {
        title: 'Analytics',
        tabs: [TABS.POINTS, TABS.REPORTS]
    }
];