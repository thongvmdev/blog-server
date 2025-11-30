import type { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IPersonalInfo {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  linkedin: string;
  avatar: string;
  objective: string;
}

export interface IEducation {
  institution: string;
  period: string;
  degree: string;
}

export interface IProject {
  name: string;
  description: string;
  teamSize?: number;
  responsibilities: string[];
  technologies: string[];
}

export interface IEmploymentHistory {
  position: string;
  company: string;
  period: string;
  projects?: IProject[];
  responsibilities?: string[];
  technologies?: string[];
}

export interface IPersonalProject {
  name: string;
  description: string;
  responsibilities?: string[];
  technologies: string[];
  deployment?: string;
  source?: string;
  demo?: string;
  note?: string;
}

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  personalInfo: IPersonalInfo;
  skills: string[];
  languages: string[];
  education: IEducation[];
  employmentHistory: IEmploymentHistory[];
  personalProjects: IPersonalProject[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IResumeKeys = keyof IResume;

