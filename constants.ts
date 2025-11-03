import { Settings, Users, ClipboardList, Medal, Hash, LayoutDashboard, UserPlus, Calendar, Edit3, BarChart2, FileText, Home, Scale, Gavel } from 'lucide-react';
import { UserRole } from './types';

export const TABS = {
  DASHBOARD: 'Dashboard',
  GENERAL_SETTINGS: 'General Settings',
  TEAMS_CATEGORIES: 'Teams & Categories',
  ITEMS: 'Items',
  GRADE_POINTS: 'Grade Points',
  CODE_LETTERS: 'Code Letters',
  JUDGES_MANAGEMENT: 'Judges & Assignments',
  DATA_ENTRY: "Participant's Data Entry",
  SCHEDULE: 'Schedule',
  JUDGEMENT: 'Judgement',
  TABULATION: 'Tabulation',
  POINTS: 'Points',
  REPORTS: 'Reports',
};

export const USER_ROLES = {
    MANAGER: UserRole.MANAGER,
    TEAM_LEADER: UserRole.TEAM_LEADER,
};

// FIX: Explicitly type DEFAULT_PAGE_PERMISSIONS to satisfy the AppState['permissions'] type.
// The inferred type was {[x: string]: string[]}, which is too wide and causes a type error.
export const DEFAULT_PAGE_PERMISSIONS: { [key in UserRole]: string[] } = {
    [UserRole.MANAGER]: Object.values(TABS),
    [UserRole.TEAM_LEADER]: [
        TABS.DASHBOARD,
        TABS.DATA_ENTRY,
        TABS.SCHEDULE,
        TABS.POINTS,
        TABS.REPORTS,
    ],
};

export const INITIALIZATION_SUB_PAGE_ICONS = {
    'General Settings': Settings,
    'Teams & Categories': Users,
    'Items': ClipboardList,
    'Grade Points': Medal,
    'Code Letters': Hash,
    'Judges & Assignments': Gavel,
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
            TABS.JUDGES_MANAGEMENT,
            TABS.DATA_ENTRY,
            TABS.SCHEDULE,
            TABS.JUDGEMENT,
            TABS.TABULATION
        ]
    },
    {
        title: 'Analytics',
        tabs: [TABS.POINTS, TABS.REPORTS]
    }
];
