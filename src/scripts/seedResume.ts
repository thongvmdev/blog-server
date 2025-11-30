// /* eslint-disable node/prefer-global/process */
// import path from 'node:path';
// import connectDB from '@/config/dbConnect';
// // import {
// //   education,
// //   employmentHistory,
// //   languages,
// //   personalInfo,
// //   personalProjects,
// //   skills,
// // } from '@/controllers/resume';
// import { ResumeModel, UserModel } from '@/models';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';

// // Load environment file from command line argument or default to .env
// const envFile = process.argv[2] ? `.env.${process.argv[2]}` : '.env';
// const envPath = path.resolve(process.cwd(), envFile);

// console.log(`Loading environment from: ${envFile}`);

// // Load the specified env file
// dotenv.config({ path: envPath });

// async function seedResume() {
//   try {
//     await connectDB();
//     console.log('Connected to database');

//     // Find user by email from personalInfo
//     const userEmail = personalInfo.email;
//     console.log('🚀 ~ seedResume ~ personalInfo:', personalInfo);
//     const user = await UserModel.findOne({ email: userEmail });

//     if (!user) {
//       console.error(`User with email ${userEmail} not found. Please create the user first.`);
//       process.exit(1);
//     }

//     console.log(`Found user: ${user.name || user.email} (ID: ${user._id})`);

//     // Check if resume already exists
//     const existingResume = await ResumeModel.findOne({ user: user._id });
//     if (existingResume) {
//       console.log('Resume already exists for this user. Updating...');
//       existingResume.personalInfo = personalInfo;
//       existingResume.skills = skills;
//       existingResume.languages = languages;
//       existingResume.education = education;
//       existingResume.employmentHistory = employmentHistory;
//       existingResume.personalProjects = personalProjects;
//       await existingResume.save();
//       console.log('Resume updated successfully!');
//       console.log(`Resume ID: ${existingResume._id}`);
//     }
//     else {
//       // Create new resume
//       const resume = new ResumeModel({
//         user: user._id,
//         personalInfo,
//         skills,
//         languages,
//         education,
//         employmentHistory,
//         personalProjects,
//       });

//       const savedResume = await resume.save();
//       console.log('Resume created successfully!');
//       console.log(`Resume ID: ${savedResume._id}`);
//     }

//     await mongoose.connection.close();
//     console.log('Database connection closed');
//     process.exit(0);
//   }
//   catch (error) {
//     console.error('Error seeding resume:', error);
//     await mongoose.connection.close();
//     process.exit(1);
//   }
// }

// seedResume();
