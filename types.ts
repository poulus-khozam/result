export interface Student {
  name: string;
  className: string;
  birthDate: string; // YYYY-MM-DD
  mobile1: string;
  score1: string | number;
  score2: string | number;
  [key: string]: any;
}

export enum AppState {
  LOADING = 'LOADING',
  SEARCH = 'SEARCH',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface SearchFormData {
  selectedClass: string;
  selectedStudentName: string;
  birthDateInput: string;
  mobileInput: string;
}
