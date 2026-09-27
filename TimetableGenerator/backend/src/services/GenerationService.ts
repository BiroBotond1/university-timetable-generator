import * as classService from './ClassService.js'
import * as locationService from './LocationService.js'
import * as teacherService from './TeacherService.js'
import * as impExpService from './ImportExportService.js';
import * as projectService from './ProjectService.js';
import * as runService from './GenerationRunService.js';

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

var PROTO_PATH = './../../generator.proto';

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var generatorProto = grpc.loadPackageDefinition(packageDefinition).generator;

var target = 'localhost:50051';

const inFlight = new Map();

// One generation at a time across the server: a single engine process running
// two searches just makes both slower. Other projects queue instead of being
// refused.
let queue = Promise.resolve();

export const isGenerating = (projectId) => inFlight.has(String(projectId));

// onUpdate receives the run's record each time it changes: queued, running,
// and its outcome. The socket layer turns those into events.
export const generate = async (projectId, { startedBy = null, onUpdate = (_run) => {} } = {}) => {
  const key = String(projectId);

  if (inFlight.has(key)) {
    throw new Error('A generation is already running for this project');
  }

  // Set before any await, so two simultaneous requests can't both pass the check.
  const entry = { call: null, cancelled: false, cancelledBy: null, runId: null, onUpdate };
  inFlight.set(key, entry);

  // Not awaited here: the queue slot must be taken synchronously to keep
  // request order.
  const queuedWrite = (async () => {
    await projectService.setGenerationStatus(projectId, 'queued');
    entry.runId = (await runService.create(projectId, startedBy))._id;
    await report(projectId, entry);
  })();

  const run = queue.then(async () => {
    // Must land before execute() sets 'running'.
    await queuedWrite;
    return execute(projectId, key, entry);
  });

  // Keep the chain alive if this run fails.
  queue = run.catch(() => {});

  return run;
};

// A listener that throws must not stop the run from being recorded.
const report = async (projectId, entry) => {
  try {
    entry.onUpdate(await runService.getById(projectId, entry.runId));
  } catch (e) {
    console.error('Could not report a generation run update:', e);
  }
};

const cancelledOutcome = (entry) => ({ status: 'cancelled', cancelledBy: entry.cancelledBy });

const execute = async (projectId, key, entry) => {
  let outcome = null;

  try {
    if (entry.cancelled) {
      outcome = cancelledOutcome(entry);
      return;
    }

    await projectService.setGenerationStatus(projectId, 'running');
    await runService.update(projectId, entry.runId, { status: 'running', startedAt: new Date() });
    await report(projectId, entry);

    const client = new generatorProto.Generator(target,
                                          grpc.credentials.createInsecure());

    const inputString = await impExpService.getTimetableData(projectId);

    // A cancel that arrived while the input was being read found no call to
    // cancel yet.
    if (entry.cancelled) {
      outcome = cancelledOutcome(entry);
      return;
    }

    const response = await new Promise((resolve, reject) => {
      entry.call = client.Generate({ input: inputString }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    const catalogs = JSON.parse(response.output);
    console.log(`Active: ${catalogs.active}`);
    console.log(`Class fitnes: ${catalogs.fitnesClas}`);
    console.log(`Teacher fitnes: ${catalogs.fitnesTeacher}`);
    console.log(`Location fitnes: ${catalogs.fitnesLocation}`);
    console.log(`Elapsed time: ${catalogs.elapsedTime}`);

    await updateCatalogs(projectId, catalogs);

    outcome = { status: 'succeeded' };

  } catch (e) {
    if (e.code === grpc.status.CANCELLED) {
      console.log('Generation was cancelled by the user.');
      outcome = cancelledOutcome(entry);
    } else {
      console.error('An error occurred:', e);
      outcome = { status: 'failed', details: String(e?.stack ?? e) };
    }
  } finally {
    inFlight.delete(key);
    await projectService.setGenerationStatus(projectId, 'idle');
    await runService.update(projectId, entry.runId, { ...outcome, finishedAt: new Date() });
    await report(projectId, entry);
  }
}

export const cancel = (projectId, cancelledBy = null) => {
  const entry = inFlight.get(String(projectId));

  if (!entry) return false;

  // Still queued: there is no gRPC call yet, so execute() skips it instead.
  entry.cancelled = true;
  entry.cancelledBy = cancelledBy;

  if (entry.call) {
    console.log('Cancelling generation...');
    entry.call.cancel();
  }

  return true;
}

async function updateCatalogs(projectId, catalogs) {
  for (const classID in catalogs.classCatalogs) {
    await classService.addCatalog(projectId, classID, catalogs.classCatalogs[classID]);
  }
  for (const teacherID in catalogs.teacherCatalogs) {
    await teacherService.addCatalog(projectId, teacherID, catalogs.teacherCatalogs[teacherID]);
  }
  for (const locationID in catalogs.locationCatalogs) {
    await locationService.addCatalog(projectId, locationID, catalogs.locationCatalogs[locationID]);
  }
}
