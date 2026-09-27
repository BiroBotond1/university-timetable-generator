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

/**
 * In-flight generations, keyed by project.
 *
 * This used to be a single module-level `call`, which was fine when there was
 * one implicit project: with several, a second run overwrote the first's
 * handle, cancel() could only ever reach the most recent one, and both runs
 * raced to write catalogs (ADR 0001).
 */
const inFlight = new Map();

/**
 * One generation at a time across the whole server, because a single
 * GeneratorServer process running two annealing searches just makes both
 * slower. Projects queue rather than being refused -- "another school is busy"
 * is not something a user can act on. A real job queue belongs with the
 * deployment work.
 */
let queue = Promise.resolve();

export const isGenerating = (projectId) => inFlight.has(String(projectId));

export const generate = async (projectId) => {
  const key = String(projectId);

  if (inFlight.has(key)) {
    throw new Error('A generation is already running for this project');
  }

  // Claim the slot before awaiting anything, so two events arriving together
  // cannot both get past the check above.
  const entry = { call: null, cancelled: false };
  inFlight.set(key, entry);

  // Started now but deliberately not awaited here: taking the queue slot must
  // happen synchronously, in request order. Awaiting first would let two
  // requests swap places depending on which database write finished first.
  const queuedWrite = projectService.setGenerationStatus(projectId, 'queued');

  const run = queue.then(async () => {
    // ...but it must land before execute() writes 'running', or the status
    // would end up stuck at 'queued' for a run that is already going.
    await queuedWrite;
    return execute(projectId, key, entry);
  });

  // Keep the chain alive even if this run throws, or every later generation
  // would inherit the rejection.
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

  // Still waiting its turn: there is no gRPC call to cancel yet, so mark it
  // and let execute() drop it when the queue reaches it.
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
