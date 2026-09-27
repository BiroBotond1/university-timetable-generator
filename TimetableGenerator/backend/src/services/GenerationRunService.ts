import { model as GenerationRun } from '../models/GenerationRun.js'

const OPEN = ['queued', 'running'];

const forClient = (query) => query
  .select('-details')
  .populate('startedBy', 'username email')
  .populate('cancelledBy', 'username email');

export const create = async (projectId, startedBy = null) => {
  return await GenerationRun.create({ project: projectId, startedBy });
};

export const update = async (projectId, id, fields) => {
  const { project, ...rest } = fields;

  return await GenerationRun.findOneAndUpdate(
    { _id: id, project: projectId },
    rest,
    { new: true }
  );
};

export const getById = async (projectId, id) => {
  return await forClient(GenerationRun.findOne({ _id: id, project: projectId }));
};

export const getRecent = async (projectId, limit = 20) => {
  return await forClient(
    GenerationRun.find({ project: projectId }).sort({ queuedAt: -1 }).limit(limit)
  );
};

// Runs live in memory, so a restart ends whatever was queued or running
// without an outcome. Called at boot, like clearStaleGenerationStatus.
export const closeInterrupted = async () => {
  const result = await GenerationRun.updateMany(
    { status: { $in: OPEN } },
    {
      $set: {
        status: 'interrupted',
        finishedAt: new Date(),
        message: 'The server restarted during this run.',
      },
    }
  );

  return result.modifiedCount;
};
