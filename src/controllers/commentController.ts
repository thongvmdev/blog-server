import type { Request, Response } from 'express';

import { CommentModel } from '@/models';

const commentController = {
  async createComment(req: Request, res: Response) {
    try {
      const comment = new CommentModel(req.body);
      await comment.save();
      res.status(201).json(comment);
    }
    catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCommentsByArticle(req: Request, res: Response) {
    try {
      const comments = await CommentModel.find({ article: req.params.articleId }).populate(
        'author',
      );
      res.status(200).json(comments);
    }
    catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteComment(req: Request, res: Response) {
    try {
      const comment = await CommentModel.findByIdAndDelete(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.status(200).json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default commentController;
