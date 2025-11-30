import type { CustomJwtMiddlewareRequest, IJwtUserPayload, IResume } from '@/interfaces';
import type { NextFunction, Request, Response } from 'express';

import { EHttpStatusCode } from '@/enums';
import { ResErrorModel, ResSuccessModel, ResumeModel } from '@/models';
import { isEmpty } from 'lodash';

async function createResume(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('User not authenticated.'));
    }

    const resumeData = req.body as Partial<IResume>;

    if (isEmpty(resumeData)) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid resume data.'));
    }

    const existingResume = await ResumeModel.findOne({ user: userId });
    if (existingResume) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Resume already exists for this user. Use update endpoint instead.'));
    }

    const newResume = new ResumeModel({
      ...resumeData,
      user: userId,
    });

    const savedResume = await newResume.save();
    await savedResume.populate('user', '-authentication');

    return res.status(EHttpStatusCode.CREATED).json(ResSuccessModel<IResume>(savedResume));
  }
  catch (error) {
    next(error);
  }
}

async function getResume(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as IJwtUserPayload)?.id;

    if (!userId) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('User not authenticated.'));
    }

    const resume = await ResumeModel.findOne({ user: userId }).populate('user', '-authentication');

    if (!resume) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Resume not found.'));
    }

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel<IResume>(resume));
  }
  catch (error) {
    next(error);
  }
}

async function getResumeById(req: Request, res: Response, next: NextFunction) {
  try {
    const { resumeId } = req.params;

    const resume = await ResumeModel.findById(resumeId).populate('user', '-authentication');

    if (!resume) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Resume not found.'));
    }

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel<IResume>(resume));
  }
  catch (error) {
    next(error);
  }
}

async function updateResume(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('User not authenticated.'));
    }

    const updateData = req.body as Partial<IResume>;

    if (isEmpty(updateData)) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid update data.'));
    }

    const resume = await ResumeModel.findOneAndUpdate({ user: userId }, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', '-authentication');

    if (!resume) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Resume not found.'));
    }

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel<IResume>(resume));
  }
  catch (error) {
    next(error);
  }
}

async function deleteResume(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('User not authenticated.'));
    }

    const deletedResume = await ResumeModel.findOneAndDelete({ user: userId });

    if (!deletedResume) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Resume not found.'));
    }

    return res.status(EHttpStatusCode.OK).json(ResSuccessModel<{ message: string }>({ message: 'Resume deleted successfully.' }));
  }
  catch (error) {
    next(error);
  }
}

const resumeController = {
  createResume,
  getResume,
  getResumeById,
  updateResume,
  deleteResume,
};

export default resumeController;
