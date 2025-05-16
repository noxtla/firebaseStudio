export interface FormData {
  phoneNumber: string;
  ssnLast4: string;
  birthDay: string;
}

export type FormStep = 0 | 1 | 2 | 3 | 4 | 5; // 0: Initial, 1: Phone, 2: SSN, 3: BirthDay, 4: Photo, 5: Complete
