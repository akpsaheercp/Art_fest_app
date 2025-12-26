export enum ItemType {
  SINGLE = 'Single',
  GROUP = 'Group',
}

export enum PerformanceType {
  ON_STAGE = 'On Stage',
  OFF_STAGE = 'Off Stage',
}

export enum ResultStatus {
  NOT_UPLOADED = 'Not Uploaded',
  UPLOADED = 'Uploaded',
  DECLARED = 'Declared',
}

export enum UserRole {
    MANAGER = 'Manager',
    TEAM_LEADER = 'Team Leader',
    THIRD_PARTY = 'Third Party',
    JUDGE = 'Judge',
}

export interface UserProfile {
    uid: string;
    email: string;
    username: string;
    role: UserRole;
    festId: string;
    teamId?: string; 
    judgeId?: string;
}

export interface User {
    id: string; 
    username: string;
    role: UserRole;
    teamId?: string; 
    judgeId?: string;
}

export interface Judge {
  id: string;
  name: string;
  place?: string;
  profession?: string;
  orderIndex?: number;
}

export interface FontConfig {
    id: string; // Mandatory ID for standalone doc
    url: string; 
    name: string; 
    family: string;
    language?: 'malayalam' | 'arabic' | 'general';
}

export interface Template {
    id: string;
    name: string;
    bg?: string;
    bgImage?: string; 
    text?: string;
    accent?: string;
    border?: string;
    description?: string;
    isCustom?: boolean;
    data?: any; // For flexible template structures
}

export interface Asset {
    id: string;
    url: string;
    type: 'background' | 'logo' | 'other';
    name: string;
}

export interface Settings {
  festivalName: string;
  organizingTeam: string;
  heading: string;
  description: string;
  eventDates?: string[]; 
  maxItemsPerParticipant: {
    onStage: number;
    offStage: number;
  };
  maxTotalItemsPerParticipant?: number | null; 
  defaultParticipantsPerItem: number;
  instructions: { [page: string]: string };
  generalInstructions: string;
  autoCodeAssignment?: boolean;
  enableFloatingNav?: boolean; 
  mobileSidebarMode?: 'floating' | 'sticky'; 
  lotEligibleCodes?: string[]; 
  eventDays?: string[];
  stages?: string[];
  timeSlots?: string[];
  defaultPoints: {
    single: { first: number; second: number; third: number; };
    group: { first: number; second: number; third: number; };
  };
  reportSettings: {
    heading: string;
    description: string;
    header: string;
    footer: string;
  };
  institutionDetails?: {
      name: string;
      address: string;
      email: string;
      contactNumber: string;
      description?: string;
      logoUrl?: string; 
  };
  branding?: {
      typographyUrl?: string; 
      teamLogoUrl?: string; 
  };
}

export interface Category {
  id: string;
  name: string;
  maxOnStage?: number;
  maxOffStage?: number;
  maxCombined?: number; 
  isGeneralCategory?: boolean;
  orderIndex?: number;
}

export interface Team {
  id: string;
  name: string;
  orderIndex?: number;
}

export interface Item {
  id: string;
  name: string;
  code?: string; 
  description: string;
  categoryId: string;
  type: ItemType;
  performanceType: PerformanceType;
  points: {
    first: number;
    second: number;
    third: number;
  };
  gradePointsOverride?: { [gradeId: string]: number }; 
  maxParticipants: number;
  maxGroupsPerTeam?: number; 
  medium: string;
  duration: number; 
  orderIndex?: number;
}

export interface Grade {
  id: string;
  name: string;
  lowerLimit: number;
  upperLimit: number;
  points: number;
}

export interface GradePointConfig {
  single: Grade[];
  group: Grade[];
}

export interface CodeLetter {
  id: string;
  code: string;
  type?: 'General' | 'On-Stage' | 'Off-Stage';
}

export interface Participant {
  id: string;
  chestNumber: string;
  name: string;
  place?: string; 
  teamId: string;
  categoryId: string;
  itemIds: string[];
  groupLeaderItemIds?: string[]; 
  itemGroups?: { [itemId: string]: number }; 
  groupChestNumbers?: { [itemId: string]: string }; 
  role?: 'leader' | 'assistant';
}

export interface ScheduledEvent {
  id: string;
  itemId: string;
  categoryId: string;
  date: string;
  time: string;
  stage: string;
}

export interface JudgeAssignment {
  id: string; 
  itemId: string;
  categoryId: string;
  judgeIds: string[];
}

export interface TabulationEntry {
  id: string; 
  itemId: string;
  categoryId: string;
  participantId: string;
  codeLetter: string;
  marks: { [judgeId: string]: number | null };
  finalMark: number | null;
  position: number | null;
  gradeId: string | null;
}

export interface Result {
    itemId: string;
    categoryId: string;
    status: ResultStatus;
    winners: {
        participantId: string;
        position: number;
        mark: number | null;
        gradeId: string | null;
    }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  snapshot?: Partial<AppState>;
}

export interface AppState {
  settings: Settings;
  categories: Category[];
  teams: Team[];
  items: Item[];
  gradePoints: GradePointConfig;
  codeLetters: CodeLetter[];
  participants: Participant[];
  schedule: ScheduledEvent[];
  judgeAssignments: JudgeAssignment[];
  tabulation: TabulationEntry[];
  results: Result[];
  judges: Judge[];
  users: User[];
  fonts: FontConfig[];
  templates: Template[];
  assets: Asset[];
  permissions: { [key in UserRole]: string[] };
  logs?: LogEntry[];
}