import { nanoid } from 'nanoid';
import slugify from 'slugify';

export function generateSlug(text: string, numIdChar: number = 4): string {
  const baseSlug = slugify(text, { lower: true });
  const uniqueId = nanoid(numIdChar);
  return `${baseSlug}-${uniqueId}`;
}
