
export interface FormData {
  phoneNumber: string;
  ssnLast4: string;
  birthDay: string;
}

export type FormStep = 0 | 1 | 2 | 3 | 4 | 5; // 0: Initial, 1: Phone, 2: SSN, 3: BirthDay, 4: Photo, 5: Complete

export interface UserData {
  Name: string;
  Puesto: string;
  phoneNumber: string;
  NSS: number; // Assuming NSS is the last 4 digits as a number
  dataBirth: string; // Expected format "YYYY-MM-DD"
}
