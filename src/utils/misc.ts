import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export const getUrlInfo = (url: string): URL => {
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (error) {
    throw new Error('Invalid URL');
  }
};

export const removeLeadingSlash = (str: string): string => {
  if (!str) return '';
  if (str === '/') return str;
  return str.replace(/^\//, '');
};

export const convertToObjectId = (ids: string[]): mongoose.Types.ObjectId[] => {
  return ids.map((id) => (typeof id === 'string' ? new ObjectId(id) : id));
};
