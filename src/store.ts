import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CVData, defaultSectionOrder, studentSectionOrder } from './types';

interface CVStore {
  data: CVData;
  updateData: (partial: Partial<CVData>) => void;
  updateNested: <K extends keyof CVData>(key: K, value: CVData[K]) => void;
  resetData: () => void;
  setTemplate: (templateId: string, userType: 'student' | 'professional') => void;
}

const initialData: CVData = {
  templateId: "",
  userType: "professional",
  fullName: "",
  title: "",
  summary: "",
  photo: "",
  contact: {
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: ""
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
  extracurriculars: [],
  references: [],
  customSections: [],
  sectionOrder: defaultSectionOrder,
  sectionVisibility: {
    photo: true,
    personal: true,
    summary: true,
    contact: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
    certifications: true,
    achievements: true,
    languages: true,
    extracurriculars: true,
    references: true
  }
};

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      data: initialData,
      updateData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
      updateNested: (key, value) => set((state) => ({ data: { ...state.data, [key]: value } })),
      resetData: () => set({ data: initialData }),
      setTemplate: (templateId, userType) => set((state) => ({
        data: {
          ...state.data,
          templateId,
          userType,
          sectionOrder: userType === 'student' ? studentSectionOrder : defaultSectionOrder
        }
      })),
    }),
    {
      name: 'smartcv-storage',
    }
  )
);
