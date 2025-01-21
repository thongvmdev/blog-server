export interface ITag extends Document {
  name: string;
  description: string;
  suggested: boolean;
  moderated: boolean;
  usageCount: number;
}

export type ITagKeys = keyof ITag;
