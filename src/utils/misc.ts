import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export function getUrlInfo(url: string): URL {
  try {
    const urlObj = new URL(url);
    return urlObj;
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    throw new Error('Invalid URL');
  }
}

export function removeLeadingSlash(str: string): string {
  if (!str)
    return '';
  if (str === '/')
    return str;
  return str.replace(/^\//, '');
}

export function convertToObjectId(ids: string[]): mongoose.Types.ObjectId[] {
  return ids.map(id => (typeof id === 'string' ? new ObjectId(id) : id));
}
