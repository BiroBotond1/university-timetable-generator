import classService from './ClassService.js'
import locationService from './LocationService.js'
import teacherService from './TeacherService.js'
import { getTimetableData } from './ImportExportService.js';

var PROTO_PATH = './../../generator.proto';

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
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

export const generate = async () => {
  try {
    var client = new generatorProto.Generator(target,
                                          grpc.credentials.createInsecure());

    const inputString = await getTimetableData();

    console.log('start generation')

    const response = await new Promise((resolve, reject) => {
      client.Generate({ input: inputString }, (err, response) => {
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

    await updateCatalogs(catalogs);

  } catch (e) {
    console.log(e);
  }
}

async function updateCatalogs(catalogs) {
  for (const classID in catalogs.classCatalogs) {
    await classService.addCatalog(classID, catalogs.classCatalogs[classID]);
  }
  for (const teacherID in catalogs.teacherCatalogs) {
    await teacherService.addCatalog(teacherID, catalogs.teacherCatalogs[teacherID]);
  }
  for (const locationID in catalogs.locationCatalogs) {
    await locationService.addCatalog(locationID, catalogs.locationCatalogs[locationID]);
  }
}
