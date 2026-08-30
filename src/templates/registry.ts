import React from 'react';
import { CVData } from '../types';
import {
  StudentMinimal,
  StudentModern,
  StudentAcademic,
  StudentCreative,
  StudentClassic,
  StudentCampusEdge,
  StudentScholarClassic
} from './StudentTemplates';
import {
  ProExecutive,
  ProModern,
  ProCreative,
  ProModernLeader,
  ProMinimal,
  ProExecutiveFrame,
  ProCorporateSidebar
} from './ProfessionalTemplates';

export interface TemplateProps {
  data: CVData;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  type: 'student' | 'professional';
  component: React.ComponentType<TemplateProps>;
  thumbnailClass: string;
}

export const templates: TemplateDefinition[] = [
  // 7 Student Templates
  { id: 'student-minimal', name: 'Campus Minimal', type: 'student', component: StudentMinimal, thumbnailClass: 'bg-rose-50 border-rose-300' },
  { id: 'student-modern', name: 'Modern Graduate', type: 'student', component: StudentModern, thumbnailClass: 'bg-teal-900 border-teal-700' },
  { id: 'student-academic', name: 'Academic Focus', type: 'student', component: StudentAcademic, thumbnailClass: 'bg-indigo-50 border-indigo-300' },
  { id: 'student-creative', name: 'Creative Student', type: 'student', component: StudentCreative, thumbnailClass: 'bg-purple-900 border-purple-700' },
  { id: 'student-classic', name: 'Classic College', type: 'student', component: StudentClassic, thumbnailClass: 'bg-emerald-50 border-emerald-300' },
  { id: 'student-campus-edge', name: 'Campus Edge', type: 'student', component: StudentCampusEdge, thumbnailClass: 'bg-indigo-950 border-cyan-400' },
  { id: 'student-scholar-classic', name: 'Scholar Classic', type: 'student', component: StudentScholarClassic, thumbnailClass: 'bg-amber-50 border-amber-400' },

  // 7 Professional Templates
  { id: 'pro-executive', name: 'Executive Suite', type: 'professional', component: ProExecutive, thumbnailClass: 'bg-slate-50 border-amber-600' },
  { id: 'pro-corporate', name: 'Corporate Classic', type: 'professional', component: ProModern, thumbnailClass: 'bg-slate-900 border-sky-600' },
  { id: 'pro-creative', name: 'Creative Professional', type: 'professional', component: ProCreative, thumbnailClass: 'bg-blue-700 border-blue-400' },
  { id: 'pro-modern', name: 'Modern Leader', type: 'professional', component: ProModernLeader, thumbnailClass: 'bg-orange-50 border-orange-600' },
  { id: 'pro-minimal', name: 'Minimal Expert', type: 'professional', component: ProMinimal, thumbnailClass: 'bg-neutral-50 border-emerald-700' },
  { id: 'pro-executive-frame', name: 'Executive Frame', type: 'professional', component: ProExecutiveFrame, thumbnailClass: 'bg-slate-100 border-slate-900' },
  { id: 'pro-corporate-sidebar', name: 'Corporate Sidebar', type: 'professional', component: ProCorporateSidebar, thumbnailClass: 'bg-emerald-950 border-emerald-500' },
];
