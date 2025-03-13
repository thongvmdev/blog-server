import type { ETypeUpload } from '@/enums';
import type { Request } from 'express';

import fs from 'node:fs';

import path from 'node:path';
import axios from 'axios';
import { getBaseUrl } from './misc';

const folderName = 'uploads';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function moveFileToUploadFolder(req: Request, fileName: string, type: ETypeUpload, id?: string): string {
  const folderPath = path.join(__dirname, `../../${folderName}`);
  const originFilePath = path.join(folderPath, fileName);
  const newFolderPath = path.join(folderPath, type, id ?? '');
  const newFilePath = path.join(newFolderPath, fileName);

  const baseUrl = getBaseUrl(req);

  ensureDir(newFolderPath);
  fs.renameSync(originFilePath, newFilePath);
  const newFilePathArr = newFilePath.split(`${folderName}/`);

  return `${baseUrl}/${folderName}/${newFilePathArr?.[1]}`;
}

export function deleteFolder(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
  else {
    console.error(`Folder not found: ${folderPath}`);
  }
}

/**
 * Removes the old profile picture if it exists
 * @param {object} user - User object containing profilePictureUrl
 * @param {object} req - Express request object
 */
export function removeOldProfilePicture(profilePictureUrl: string, req: Request) {
  if (!profilePictureUrl)
    return;

  try {
    // Get the file path from the URL
    const baseUrl = getBaseUrl(req);
    const relativePath = profilePictureUrl.replace(baseUrl, '');
    const absolutePath = path.join(__dirname, '../../', relativePath);

    // Check if file exists and delete it
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`Successfully removed old profile picture: ${absolutePath}`);
    }
    else {
      console.log(`Profile picture not found at: ${absolutePath}`);
    }
  }
  catch (error) {
    console.error('Error removing old profile picture:', error.message);
  }
}

export async function downloadAndSaveImage(req: Request, imageUrl: string, userId: string): Promise<string> {
  const uploadsPath = path.join(__dirname, '../../uploads/users', userId);
  const baseUrl = getBaseUrl(req);

  ensureDir(uploadsPath);

  // Create a unique filename
  const fileExtension = path.extname(new URL(imageUrl).pathname) || '.jpg';
  const fileName = `avatar-${Date.now()}${fileExtension}`;
  const filePath = path.join(uploadsPath, fileName);

  // Download and save the image
  const response = await axios({
    method: 'get',
    url: imageUrl,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(filePath);

  await new Promise<void>((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return `${baseUrl}/${folderName}/users/${userId}/${fileName}`;
}
