
export interface FormData {
  phoneNumber: string;
  ssnLast4: string;
  birthDay: string;
}

export type FormStep = 0 | 1 | 2 | 3 | 4 | 5; // 0: Initial, 1: Phone, 2: SSN, 3: BirthDay, 4: Photo, 5: Complete

export interface UserData {
  SSN: any;
  Name: string;
  Puesto: string;
  phoneNumber: string;
  NSS: number | string; // NSS can be string or number
  dataBirth: string; // Expected format "YYYY-MM-DD"
  flagTime?: string; // Optional
  Vehicles?: string[]; // Optional array of vehicle numbers
}

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number; // Timestamp from the geolocation API
}

// --- Job Briefing Types ---
export interface JobBriefingFormData {
  // Step 1: Basic Info
  date: Date | undefined;
  time: string;
  crewNumber: string;
  crewPhoneNumber: string;
  generalForemanName: string;
  foremanName: string;
  workLocation: string;

  // Step 2: Emergency Contacts & Site Info (to be added)
  emergencyContactPerson: string;
  medicalCenterPhone: string;
  medicalCenterAddress: string;
  nearestMedicalCenter: string;
  helicopterService: 'yes' | 'no' | 'plan';
  helicopterPlanDetails?: string;
  fireDangerLevel: string; // e.g., 'low', 'medium', 'high', 'extreme'
  utilityCompanyName: string;
  utilityCompanyContact: string;
  utilityCompanyPhone: string;
  employeeCount: number | undefined;
  emergencyMeetingPoint: string;
  environmentalConcerns: 'yes' | 'no';
  spillContact?: string;
  
  // Step 3: Task Description & Crew Readiness (to be added)
  // Step 4: Human Performance & Foreman Acknowledgment (to be added)
  // Step 5: High-Energy Sources (to be added)
  // Step 6: Mitigation Controls (to be added)
}

// Define Zod schemas for validation later if needed for each step
