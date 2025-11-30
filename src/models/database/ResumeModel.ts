import type { IEducation, IEmploymentHistory, IPersonalInfo, IPersonalProject, IResume } from '@/interfaces';
import { envConfig } from '@/config/env.config';

import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

const PersonalInfoSchema = new Schema<IPersonalInfo>(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 100 },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    location: { type: String, required: true, minlength: 1, maxlength: 200 },
    phone: { type: String, required: true, minlength: 1, maxlength: 20 },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: 'Invalid email format',
      },
    },
    dateOfBirth: { type: String, required: true, minlength: 1, maxlength: 20 },
    linkedin: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (!url)
            return true;
          return validator.isURL(url);
        },
        message: 'Invalid LinkedIn URL format',
      },
    },
    avatar: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (!url)
            return true;
          if (envConfig.NODE_ENV === 'development' && url.startsWith('http://localhost')) {
            return true;
          }
          return validator.isURL(url);
        },
        message: 'Invalid avatar URL format',
      },
    },
    objective: { type: String, required: true, minlength: 1, maxlength: 2000 },
  },
  { _id: false },
);

const EducationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true, minlength: 1, maxlength: 200 },
    period: { type: String, required: true, minlength: 1, maxlength: 100 },
    degree: { type: String, required: true, minlength: 1, maxlength: 200 },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 200 },
    description: { type: String, required: true, minlength: 1, maxlength: 2000 },
    teamSize: { type: Number, min: 1 },
    responsibilities: [{ type: String, minlength: 1, maxlength: 500 }],
    technologies: [{ type: String, minlength: 1, maxlength: 100 }],
  },
  { _id: false },
);

const EmploymentHistorySchema = new Schema<IEmploymentHistory>(
  {
    position: { type: String, required: true, minlength: 1, maxlength: 100 },
    company: { type: String, required: true, minlength: 1, maxlength: 200 },
    period: { type: String, required: true, minlength: 1, maxlength: 100 },
    projects: [ProjectSchema],
    responsibilities: [{ type: String, minlength: 1, maxlength: 500 }],
    technologies: [{ type: String, minlength: 1, maxlength: 100 }],
  },
  { _id: false },
);

const PersonalProjectSchema = new Schema<IPersonalProject>(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 200 },
    description: { type: String, required: true, minlength: 1, maxlength: 2000 },
    responsibilities: [{ type: String, minlength: 1, maxlength: 500 }],
    technologies: [{ type: String, required: true, minlength: 1, maxlength: 100 }],
    deployment: { type: String, maxlength: 500 },
    source: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (!url)
            return true;
          return validator.isURL(url);
        },
        message: 'Invalid source URL format',
      },
    },
    demo: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (!url)
            return true;
          return validator.isURL(url);
        },
        message: 'Invalid demo URL format',
      },
    },
    note: { type: String, maxlength: 500 },
  },
  { _id: false },
);

const ResumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    personalInfo: {
      type: PersonalInfoSchema,
      required: true,
    },
    skills: [{ type: String, minlength: 1, maxlength: 100 }],
    languages: [{ type: String, minlength: 1, maxlength: 50 }],
    education: [EducationSchema],
    employmentHistory: [EmploymentHistorySchema],
    personalProjects: [PersonalProjectSchema],
  },
  { timestamps: true },
);

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);
