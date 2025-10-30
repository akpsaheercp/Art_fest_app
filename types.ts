export enum ItemType {
  SINGLE = 'Single',
  GROUP = 'Group',
}

export interface Settings {
  organizingTeam: string;
  heading: string;
  description: string;
  maxItemsPerParticipant: number;
  defaultParticipantsPerItem: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Team {
  id:string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  type: ItemType;
  points: {
    first: number;
    second: number;
    third: number;
  };
  maxParticipants: number;
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
}

export interface Participant {
  id: string;
  chestNumber: string;
  name: string;
  teamId: string;
  categoryId: string;
  itemIds: string[];
}

export interface ScheduledEvent {
  id: string;
  itemId: string;
  categoryId: string;
  date: string;
  time: string;
  stage: string;
}

export interface TabulationEntry {
  id: string; // Composite key: `${itemId}-${participantId}`
  itemId: string;
  categoryId: string;
  participantId: string;
  codeLetter: string;
  mark: number | null;
  position: number | null;
  gradeId: string | null;
}

export interface Result {
    itemId: string;
    categoryId: string;
    declared: boolean;
    winners: {
        participantId: string;
        position: number;
        mark: number | null;
        gradeId: string | null;
    }[];
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
  tabulation: TabulationEntry[];
  results: Result[];
}

export type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'REORDER_CATEGORIES'; payload: Category[] }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'DELETE_MULTIPLE_CATEGORIES'; payload: string[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'REORDER_TEAMS'; payload: Team[] }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'DELETE_MULTIPLE_TEAMS'; payload: string[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'ADD_MULTIPLE_ITEMS'; payload: Item[] }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'DELETE_MULTIPLE_ITEMS'; payload: string[] }
  | { type: 'ADD_GRADE'; payload: { itemType: 'single' | 'group', grade: Grade } }
  | { type: 'DELETE_GRADE'; payload: { itemType: 'single' | 'group', gradeId: string } }
  | { type: 'ADD_CODE_LETTER'; payload: CodeLetter }
  | { type: 'UPDATE_CODE_LETTER'; payload: CodeLetter }
  | { type: 'REORDER_CODE_LETTERS'; payload: CodeLetter[] }
  | { type: 'DELETE_CODE_LETTER'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'ADD_MULTIPLE_PARTICIPANTS'; payload: Participant[] }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'DELETE_MULTIPLE_PARTICIPANTS'; payload: string[] }
  | { type: 'SET_SCHEDULE'; payload: ScheduledEvent[] }
  | { type: 'UPDATE_TABULATION_ENTRY'; payload: TabulationEntry }
  | { type: 'DECLARE_RESULT'; payload: { itemId: string, categoryId: string } };