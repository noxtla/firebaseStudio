
import type { JobBriefingFormData } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface JobBriefingState {
  formData: JobBriefingFormData;
  setFormData: (data: Partial<JobBriefingFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const initialFormData: JobBriefingFormData = {
  date: undefined,
  time: '',
  crewNumber: '',
  crewPhoneNumber: '',
  generalForemanName: '',
  foremanName: '',
  workLocation: '',
  emergencyContactPerson: '',
  medicalCenterPhone: '',
  medicalCenterAddress: '',
  nearestMedicalCenter: '',
  helicopterService: 'no',
  helicopterPlanDetails: '',
  fireDangerLevel: '',
  utilityCompanyName: '',
  utilityCompanyContact: '',
  utilityCompanyPhone: '',
  employeeCount: undefined,
  emergencyMeetingPoint: '',
  environmentalConcerns: 'no',
  spillContact: '',
};

export const useJobBriefingStore = create<JobBriefingState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
      resetForm: () => set({ formData: initialFormData, currentStep: 1 }),
    }),
    {
      name: 'job-briefing-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
