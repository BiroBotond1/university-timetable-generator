/*import dbConnection from './connection.js';

export const createTables = async () => {
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS teachers (
        ID int NOT NULL AUTO_INCREMENT,
        name varchar(50),
        PRIMARY KEY (ID));
    `);
    console.log('Table teachers created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS ineligibleDates (
        ID int NOT NULL auto_increment,
        day int,
        hour int,
        teacherID int,
        PRIMARY KEY (ID),
        FOREIGN KEY (teacherID) REFERENCES teachers(ID));
    `);
    console.log('Table ineligibleDates created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS locations (
        ID int NOT NULL AUTO_INCREMENT,
        name varchar(50),
        PRIMARY KEY (ID));
    `);
    console.log('Table locations created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS reservedDates (
        ID int NOT NULL auto_increment,
        day int,
        hour int,
        locationID int,
        PRIMARY KEY (ID),
        FOREIGN KEY (locationID) REFERENCES locations(ID));
    `);
    console.log('Table reservedDates created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS classes (
        ID int NOT NULL auto_increment,
        name varchar(50),
        locationID int,
        PRIMARY KEY (ID),
        FOREIGN KEY (locationID) REFERENCES locations(ID));
    `);
    console.log('Table classes created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS subjects (
        ID int NOT NULL auto_increment,
        name varchar(50),
        locationID int,
        PRIMARY KEY (ID),
        FOREIGN KEY (locationID) REFERENCES locations(ID));
    `);
    console.log('Table subjects created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
  try {
    await dbConnection.executeQuery(`CREATE TABLE IF NOT EXISTS classHours (
        ID int NOT NULL auto_increment,
        number int,
        classID int,
        subjectID int,
        teacherID int,
        PRIMARY KEY (ID),
        FOREIGN KEY (classID) REFERENCES classes(ID),
        FOREIGN KEY (subjectID) REFERENCES subjects(ID),
        FOREIGN KEY (teacherID) REFERENCES teachers(ID));
    `);
    console.log('Table classHours created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
};*/