export enum ItemType {
  SINGLE = 'Single',
  GROUP = 'Group',
}

export interface Settings {
  organizingTeam: string;
  heading: string;
  maxItemsPerParticipant: number;
  defaultParticipantsPerItem: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Team {
  id: string;
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
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_GRADE'; payload: { itemType: 'single' | 'group', grade: Grade } }
  | { type: 'DELETE_GRADE'; payload: { itemType: 'single' | 'group', gradeId: string } }
  | { type: 'ADD_CODE_LETTER'; payload: CodeLetter }
  | { type: 'DELETE_CODE_LETTER'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'SET_SCHEDULE'; payload: ScheduledEvent[] }
  | { type: 'UPDATE_TABULATION_ENTRY'; payload: TabulationEntry }
  | { type: 'DECLARE_RESULT'; payload: { itemId: string, categoryId: string } };