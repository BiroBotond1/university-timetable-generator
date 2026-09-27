import * as classService from './ClassService.js'
import * as locationService from './LocationService.js'
import * as teacherService from './TeacherService.js'
import * as impExpService from './ImportExportService.js';
import * as projectService from './ProjectService.js';

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

export const generate = async (projectId) => {
  const key = String(projectId);

  if (inFlight.has(key)) {
    throw new Error('A generation is already running for this project');
  }

  // Set before any await, so two simultaneous requests can't both pass the check.
  const entry = { call: null, cancelled: false };
  inFlight.set(key, entry);

  // Not awaited here: the queue slot must be taken synchronously to keep
  // request order.
  const queuedWrite = projectService.setGenerationStatus(projectId, 'queued');

  const run = queue.then(async () => {
    // Must land before execute() sets 'running'.
    await queuedWrite;
    return execute(projectId, key, entry);
  });

  // Keep the chain alive if this run fails.
  queue = run.catch(() => {});

  return run;
};

const execute = async (projectId, key, entry) => {
  try {
    if (entry.cancelled) return;

    await projectService.setGenerationStatus(projectId, 'running');

    const client = new generatorProto.Generator(target,
                                          grpc.credentials.createInsecure());

    const inputString = await impExpService.getTimetableData(projectId);

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

  } catch (e) {
    if (e.code === grpc.status.CANCELLED) {
      console.log('Generation was cancelled by the user.');
    } else {
      console.error('An error occurred:', e);
    }
  } finally {
    inFlight.delete(key);
    await projectService.setGenerationStatus(projectId, 'idle');
  }
}

export const cancel = (projectId) => {
  const entry = inFlight.get(String(projectId));

  if (!entry) return false;

  // Still queued: there is no gRPC call yet, so execute() skips it instead.
  entry.cancelled = true;

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
