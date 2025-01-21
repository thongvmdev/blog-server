import mongoose, { Schema } from 'mongoose';

const CommentSchema: Schema = new Schema({
  article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CommentModel = mongoose.model('Comment', CommentSchema);
