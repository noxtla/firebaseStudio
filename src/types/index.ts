export interface UserData {
  Name: string;
  phoneNumber: string;
  ///SSN?: string; // Changed from 'any' to 'string'
  ///birth_date?: string; // Expected in YYYY-MM-DD format
  Position?: string; // Changed from 'Puesto' for consistency
  flagTime?: string;
  Vehicles?: string[];
  // The 'NSS' field from your original type is preserved if needed.
  NSS?: number | string;
}

// Other existing types
export type FormStep = 0 | 1 | 2 | 3;

export interface FormData {
  phoneNumber: string;
  /*ssnLast4: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;*/
}

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}