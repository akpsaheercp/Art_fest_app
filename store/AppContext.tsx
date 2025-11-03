import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { AppState, Action, ItemType, Result, TabulationEntry, ResultStatus, UserRole } from '../types';
import { DEFAULT_PAGE_PERMISSIONS } from '../constants';

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
  judgeAssignments: [],
  tabulation: [],
  results: [],
  judges: [],
  users: [
    { id: 'user_manager_default', username: 'Amazio', password: 'Admin@123', role: UserRole.MANAGER },
  ],
  permissions: DEFAULT_PAGE_PERMISSIONS,
};

const calculateFinalMark = (marks: { [judgeId: string]: number | null }): number | null => {
    const validMarks = Object.values(marks || {}).filter(m => m !== null) as number[];
    return validMarks.length > 0 ? validMarks.reduce((a, b) => a + b, 0) / validMarks.length : null;
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
    case 'DELETE_MULTIPLE_CATEGORIES': {
        const categoryIdsToDelete = new Set(
            action.type === 'DELETE_CATEGORY' ? [action.payload] : action.payload
        );

        const itemsToDelete = new Set(state.items.filter(i => categoryIdsToDelete.has(i.categoryId)).map(i => i.id));
        const participantsToDelete = new Set(state.participants.filter(p => categoryIdsToDelete.has(p.categoryId)).map(p => p.id));

        const newCategories = state.categories.filter(c => !categoryIdsToDelete.has(c.id));
        const newItems = state.items.filter(i => !categoryIdsToDelete.has(i.categoryId));
        const newParticipants = state.participants.filter(p => !categoryIdsToDelete.has(p.categoryId));
        const newSchedule = state.schedule.filter(s => !categoryIdsToDelete.has(s.categoryId) && !itemsToDelete.has(s.itemId));
        const newJudgeAssignments = state.judgeAssignments.filter(j => !categoryIdsToDelete.has(j.categoryId) && !itemsToDelete.has(j.itemId));
        const newTabulation = state.tabulation.filter(t => !categoryIdsToDelete.has(t.categoryId) && !participantsToDelete.has(t.participantId));
        const newResults = state.results.filter(r => !categoryIdsToDelete.has(r.categoryId));

        return { ...state, categories: newCategories, items: newItems, participants: newParticipants, schedule: newSchedule, judgeAssignments: newJudgeAssignments, tabulation: newTabulation, results: newResults };
    }
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
        return { ...state, teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'REORDER_TEAMS':
        return { ...state, teams: action.payload };
    case 'DELETE_TEAM':
    case 'DELETE_MULTIPLE_TEAMS': {
        const teamIdsToDelete = new Set(
            action.type === 'DELETE_TEAM' ? [action.payload] : action.payload
        );
        
        const participantsToDelete = state.participants.filter(p => teamIdsToDelete.has(p.teamId)).map(p => p.id);
        const participantIdsToDelete = new Set(participantsToDelete);
        
        const newTeams = state.teams.filter(t => !teamIdsToDelete.has(t.id));
        const newParticipants = state.participants.filter(p => !teamIdsToDelete.has(p.teamId));
        const newUsers = state.users.map(u => u.teamId && teamIdsToDelete.has(u.teamId) ? { ...u, teamId: undefined } : u);
        const newTabulation = state.tabulation.filter(t => !participantIdsToDelete.has(t.participantId));
        const newResults = state.results.map(r => ({
            ...r,
            winners: r.winners.filter(w => !participantIdsToDelete.has(w.participantId)),
        }));

        return { ...state, teams: newTeams, participants: newParticipants, users: newUsers, tabulation: newTabulation, results: newResults };
    }
    case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.payload] };
    case 'ADD_MULTIPLE_ITEMS':
        return { ...state, items: [...state.items, ...action.payload] };
    case 'UPDATE_ITEM':
        return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_ITEM':
    case 'DELETE_MULTIPLE_ITEMS': {
        const itemIdsToDelete = new Set(
            action.type === 'DELETE_ITEM' ? [action.payload] : action.payload
        );
        
        const newItems = state.items.filter(i => !itemIdsToDelete.has(i.id));
        const newParticipants = state.participants.map(p => ({
            ...p,
            itemIds: p.itemIds.filter(id => !itemIdsToDelete.has(id))
        }));
        const newSchedule = state.schedule.filter(s => !itemIdsToDelete.has(s.itemId));
        const newJudgeAssignments = state.judgeAssignments.filter(j => !itemIdsToDelete.has(j.itemId));
        const newTabulation = state.tabulation.filter(t => !itemIdsToDelete.has(t.itemId));
        const newResults = state.results.filter(r => !itemIdsToDelete.has(r.itemId));

        return { ...state, items: newItems, participants: newParticipants, schedule: newSchedule, judgeAssignments: newJudgeAssignments, tabulation: newTabulation, results: newResults };
    }
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
    case 'DELETE_MULTIPLE_PARTICIPANTS': {
        const participantIdsToDelete = new Set(
             action.type === 'DELETE_PARTICIPANT' ? [action.payload] : action.payload
        );

        const newParticipants = state.participants.filter(p => !participantIdsToDelete.has(p.id));
        const newTabulation = state.tabulation.filter(t => !participantIdsToDelete.has(t.participantId));
        const newResults = state.results.map(r => ({
            ...r,
            winners: r.winners.filter(w => !participantIdsToDelete.has(w.participantId))
        }));

        return { ...state, participants: newParticipants, tabulation: newTabulation, results: newResults };
    }
    case 'ADD_JUDGE':
        return { ...state, judges: [...state.judges, action.payload] };
    case 'UPDATE_JUDGE':
        return { ...state, judges: state.judges.map(j => j.id === action.payload.id ? action.payload : j) };
    case 'REORDER_JUDGES':
        return { ...state, judges: action.payload };
    case 'DELETE_JUDGE':
    case 'DELETE_MULTIPLE_JUDGES': {
        const judgeIdsToDelete = new Set(
            action.type === 'DELETE_JUDGE' ? [action.payload] : action.payload
        );
        const newJudges = state.judges.filter(j => !judgeIdsToDelete.has(j.id));
        
        const newJudgeAssignments = state.judgeAssignments.map(a => ({
            ...a,
            judgeIds: a.judgeIds.filter(id => !judgeIdsToDelete.has(id))
        }));

        const newTabulation = state.tabulation.map(t => {
            const newMarks = { ...t.marks };
            let marksChanged = false;
            judgeIdsToDelete.forEach(judgeId => {
                if (newMarks[judgeId] !== undefined) {
                    delete newMarks[judgeId];
                    marksChanged = true;
                }
            });
            if (marksChanged) {
                return { ...t, marks: newMarks, finalMark: calculateFinalMark(newMarks) };
            }
            return t;
        });

        return { ...state, judges: newJudges, judgeAssignments: newJudgeAssignments, tabulation: newTabulation };
    }
    case 'SET_SCHEDULE':
        return { ...state, schedule: action.payload };
    case 'UPDATE_ITEM_JUDGES': {
        const { itemId, categoryId, judgeIds } = action.payload;
        const id = `${itemId}-${categoryId}`;
        const existingIndex = state.judgeAssignments.findIndex(a => a.id === id);
        let newAssignments = [...state.judgeAssignments];
        if (existingIndex > -1) {
            newAssignments[existingIndex] = { ...newAssignments[existingIndex], judgeIds };
        } else {
            newAssignments.push({ id, itemId, categoryId, judgeIds });
        }
        return { ...state, judgeAssignments: newAssignments };
    }
    case 'UPDATE_TABULATION_ENTRY': {
        const newEntry = action.payload;
        newEntry.finalMark = calculateFinalMark(newEntry.marks);

        const existingIndex = state.tabulation.findIndex(t => t.id === action.payload.id);
        if (existingIndex > -1) {
            const newTabulation = [...state.tabulation];
            newTabulation[existingIndex] = newEntry;
            return { ...state, tabulation: newTabulation };
        }
        return { ...state, tabulation: [...state.tabulation, newEntry] };
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

        const relevantEntries = state.tabulation.filter(t => t.itemId === itemId && t.categoryId === categoryId && t.finalMark !== null);
        const sortedEntries = [...relevantEntries].sort((a, b) => (b.finalMark ?? 0) - (a.finalMark ?? 0));
        
        let rank = 0;
        let lastMark = -1;
        const winners = sortedEntries.map((entry, index) => {
            if (entry.finalMark !== lastMark) {
                rank = index + 1;
            }
            lastMark = entry.finalMark!;
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
                    gradeId: getGradeId(t.finalMark)
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
                mark: w.finalMark,
                gradeId: getGradeId(w.finalMark)
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
     case 'ADD_USER':
        return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
        return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    case 'DELETE_USER':
        return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'UPDATE_PERMISSIONS':
        return {
            ...state,
            permissions: {
                ...state.permissions,
                [action.payload.role]: action.payload.pages,
            },
        };
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

        // Migration logic for users
        if (!parsedState.users || parsedState.users.length === 0) {
            parsedState.users = initialState.users;
        }
        
        // Migration logic for permissions
        if (!parsedState.permissions) {
            parsedState.permissions = DEFAULT_PAGE_PERMISSIONS;
        }

        dispatch({ type: 'SET_STATE', payload: parsedState });
      } catch (error) {
        console.error("Failed to parse state from localStorage", error);
        localStorage.removeItem('artFestState');
      }
    }
  }, []);

  useEffect(() => {
    // Avoid storing passwords in localStorage in a real app
    const stateToSave = { ...state };
    stateToSave.users = stateToSave.users.map(({ password, ...user }) => user);
    localStorage.setItem('artFestState', JSON.stringify(stateToSave));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};