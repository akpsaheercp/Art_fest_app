import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { AppState, Action, ItemType, Result, TabulationEntry, ResultStatus } from '../types';

const initialState: AppState = {
  settings: {
    organizingTeam: 'Creative Arts Committee',
    heading: 'Amazio_2026',
    description: "Welcome, Manager! Here's a summary of your event.",
    maxItemsPerParticipant: 5,
    defaultParticipantsPerItem: 1,
  },
  categories: [
    { id: 'cat1', name: 'Junior' },
    { id: 'cat2', name: 'Senior' },
  ],
  teams: [
    { id: 'team1', name: 'Red House' },
    { id: 'team2', name: 'Blue House' },
    { id: 'team3', name: 'Green House' },
  ],
  items: [
    { id: 'item1', name: 'Solo Song', categoryId: 'cat1', type: ItemType.SINGLE, points: { first: 5, second: 3, third: 1 }, maxParticipants: 1 },
    { id: 'item2', name: 'Group Dance', categoryId: 'cat2', type: ItemType.GROUP, points: { first: 10, second: 7, third: 5 }, maxParticipants: 8 },
  ],
  gradePoints: {
    single: [
      { id: 'sg1', name: 'A Grade', lowerLimit: 80, upperLimit: 100, points: 5 },
      { id: 'sg2', name: 'B Grade', lowerLimit: 60, upperLimit: 79, points: 3 },
    ],
    group: [
      { id: 'gg1', name: 'A Grade', lowerLimit: 80, upperLimit: 100, points: 10 },
      { id: 'gg2', name: 'B Grade', lowerLimit: 60, upperLimit: 79, points: 7 },
    ],
  },
  codeLetters: [
    {id: 'cl1', code: 'A1'}, {id: 'cl2', code: 'B2'}, {id: 'cl3', code: 'C3'},
  ],
  participants: [
    { id: 'p1', chestNumber: '101', name: 'John Doe', teamId: 'team1', categoryId: 'cat1', itemIds: ['item1'] },
    { id: 'p2', chestNumber: '201', name: 'Jane Smith', teamId: 'team2', categoryId: 'cat2', itemIds: ['item2'] },
  ],
  schedule: [],
  tabulation: [],
  results: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
        return action.payload;
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'REORDER_CATEGORIES':
        return { ...state, categories: action.payload };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'DELETE_MULTIPLE_CATEGORIES':
      return { ...state, categories: state.categories.filter(c => !action.payload.includes(c.id)) };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
        return { ...state, teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'REORDER_TEAMS':
        return { ...state, teams: action.payload };
    case 'DELETE_TEAM':
      return { ...state, teams: state.teams.filter(t => t.id !== action.payload) };
    case 'DELETE_MULTIPLE_TEAMS':
      return { ...state, teams: state.teams.filter(t => !action.payload.includes(t.id)) };
    case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.payload] };
    case 'ADD_MULTIPLE_ITEMS':
        return { ...state, items: [...state.items, ...action.payload] };
    case 'UPDATE_ITEM':
        return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_ITEM':
        return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'DELETE_MULTIPLE_ITEMS':
        return { ...state, items: state.items.filter(i => !action.payload.includes(i.id)) };
    case 'ADD_GRADE':
        return {
            ...state,
            gradePoints: {
                ...state.gradePoints,
                [action.payload.itemType]: [...state.gradePoints[action.payload.itemType], action.payload.grade]
            }
        };
    case 'DELETE_GRADE':
        return {
            ...state,
            gradePoints: {
                ...state.gradePoints,
                [action.payload.itemType]: state.gradePoints[action.payload.itemType].filter(g => g.id !== action.payload.gradeId)
            }
        };
    case 'ADD_CODE_LETTER':
        return { ...state, codeLetters: [...state.codeLetters, action.payload] };
    case 'UPDATE_CODE_LETTER':
        return { ...state, codeLetters: state.codeLetters.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'REORDER_CODE_LETTERS':
        return { ...state, codeLetters: action.payload };
    case 'DELETE_CODE_LETTER':
        return { ...state, codeLetters: state.codeLetters.filter(c => c.id !== action.payload) };
    case 'ADD_PARTICIPANT':
        return { ...state, participants: [...state.participants, action.payload] };
    case 'ADD_MULTIPLE_PARTICIPANTS':
        return { ...state, participants: [...state.participants, ...action.payload] };
    case 'UPDATE_PARTICIPANT':
        return { ...state, participants: state.participants.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PARTICIPANT':
        return { ...state, participants: state.participants.filter(p => p.id !== action.payload) };
    case 'DELETE_MULTIPLE_PARTICIPANTS':
        return { ...state, participants: state.participants.filter(p => !action.payload.includes(p.id)) };
    case 'SET_SCHEDULE':
        return { ...state, schedule: action.payload };
    case 'UPDATE_TABULATION_ENTRY': {
        const existingIndex = state.tabulation.findIndex(t => t.id === action.payload.id);
        if (existingIndex > -1) {
            const newTabulation = [...state.tabulation];
            newTabulation[existingIndex] = action.payload;
            return { ...state, tabulation: newTabulation };
        }
        return { ...state, tabulation: [...state.tabulation, action.payload] };
    }
    case 'UPDATE_RESULT_STATUS': {
        const { itemId, categoryId, status } = action.payload;
        const existingResultIndex = state.results.findIndex(
            r => r.itemId === itemId && r.categoryId === categoryId
        );
        let newResults = [...state.results];

        if (existingResultIndex > -1) {
            newResults[existingResultIndex] = {
                ...newResults[existingResultIndex],
                status,
            };
        } else {
            newResults.push({
                itemId,
                categoryId,
                status,
                winners: [],
            });
        }
        return { ...state, results: newResults };
    }
    case 'DECLARE_RESULT': {
        const { itemId, categoryId } = action.payload;
        const item = state.items.find(i => i.id === itemId);
        if (!item) return state;

        const relevantEntries = state.tabulation.filter(t => t.itemId === itemId && t.categoryId === categoryId && t.mark !== null);
        const sortedEntries = [...relevantEntries].sort((a, b) => (b.mark ?? 0) - (a.mark ?? 0));
        
        let rank = 0;
        let lastMark = -1;
        const winners = sortedEntries.map((entry, index) => {
            if (entry.mark !== lastMark) {
                rank = index + 1;
            }
            lastMark = entry.mark!;
            return { ...entry, position: rank };
        }).filter(e => e.position <= 3);

        const gradeConfig = item.type === ItemType.SINGLE ? state.gradePoints.single : state.gradePoints.group;
        const getGradeId = (mark: number | null) => {
            if (mark === null) return null;
            const grade = gradeConfig.find(g => mark >= g.lowerLimit && mark <= g.upperLimit);
            return grade ? grade.id : null;
        };

        const updatedTabulation = state.tabulation.map(t => {
            if (t.itemId === itemId && t.categoryId === categoryId) {
                const winnerInfo = winners.find(w => w.participantId === t.participantId);
                return {
                    ...t,
                    position: winnerInfo ? winnerInfo.position : null,
                    gradeId: getGradeId(t.mark)
                };
            }
            return t;
        });
        
        const newResult: Result = {
            itemId,
            categoryId,
            status: ResultStatus.DECLARED,
            winners: winners.map(w => ({
                participantId: w.participantId,
                position: w.position,
                mark: w.mark,
                gradeId: getGradeId(w.mark)
            }))
        };

        const existingResultIndex = state.results.findIndex(r => r.itemId === itemId && r.categoryId === categoryId);
        let newResults = [...state.results];
        if (existingResultIndex > -1) {
            newResults[existingResultIndex] = newResult;
        } else {
            newResults.push(newResult);
        }
        
        return { ...state, tabulation: updatedTabulation, results: newResults };
    }
    default:
      return state;
  }
};

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('artFestState');
    if (savedState) {
      try {
        let parsedState = JSON.parse(savedState);
        // Migration logic for results status
        if (parsedState.results) {
            parsedState.results = parsedState.results.map((r: any) => {
                if (typeof r.declared === 'boolean') {
                    const newResult = { ...r, status: r.declared ? ResultStatus.DECLARED : ResultStatus.NOT_UPLOADED };
                    delete newResult.declared;
                    return newResult;
                }
                return r;
            });
        }
        dispatch({ type: 'SET_STATE', payload: parsedState });
      } catch (error) {
        console.error("Failed to parse state from localStorage", error);
        localStorage.removeItem('artFestState');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('artFestState', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};