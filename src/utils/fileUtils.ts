import type { ETypeUpload } from '@/enums';
import fs from 'node:fs';

import path from 'node:path';

import axios from 'axios';

const folderName = 'uploads';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function moveFileToUploadFolder(fileName: string, type: ETypeUpload, id?: string): string {
  const folderPath = path.join(__dirname, `../../${folderName}`);
  const originFilePath = path.join(folderPath, fileName);
  const newFolderPath = path.join(folderPath, type, id ?? '');
  const newFilePath = path.join(newFolderPath, fileName);

  ensureDir(newFolderPath);
  fs.renameSync(originFilePath, newFilePath);
  const newFilePathArr = newFilePath.split(`${folderName}/`);

  return `/${folderName}/${newFilePathArr?.[1]}`;
}

export function deleteFolder(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
  else {
    console.error(`Folder not found: ${folderPath}`);
  }
}

export async function downloadAndSaveImage(imageUrl: string, userId: string): Promise<string> {
  const uploadsPath = path.join(__dirname, '../../uploads/users', userId);

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

  return `${folderName}/users/${userId}/${fileName}`;
}
