create database if not exists timetableDB;

use timetableDB;

CREATE TABLE IF NOT EXISTS teachers (
      ID int NOT NULL AUTO_INCREMENT,
      name varchar(50),
      PRIMARY KEY (ID));

CREATE TABLE IF NOT EXISTS ineligibleDates (
	ID int NOT NULL auto_increment,
    day int,
    hour int,
    teacherID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (teacherID) REFERENCES teachers(ID));
    
CREATE TABLE IF NOT EXISTS locations (
      ID int NOT NULL AUTO_INCREMENT,
      name varchar(50),
      PRIMARY KEY (ID));
    
CREATE TABLE IF NOT EXISTS reservedDates (
	ID int NOT NULL auto_increment,
    day int,
    hour int,
    locationID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (locationID) REFERENCES locations(ID));

CREATE TABLE IF NOT EXISTS classes (
	ID int NOT NULL auto_increment,
    name varchar(50),
    locationID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (locationID) REFERENCES locations(ID));

CREATE TABLE IF NOT EXISTS subjects (
	ID int NOT NULL auto_increment,
    name varchar(50),
    locationID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (locationID) REFERENCES locations(ID));

CREATE TABLE IF NOT EXISTS classHours (
	ID int NOT NULL auto_increment,
    number int,
    classID int,
    subjectID int,
    teacherID int,
    PRIMARY KEY (ID),
    FOREIGN KEY (classID) REFERENCES classes(ID),
    FOREIGN KEY (subjectID) REFERENCES subjects(ID),
    FOREIGN KEY (teacherID) REFERENCES teachers(ID));
    
select * from teachers;
select * from ineligibleDates;
select * from locations;
select * from reservedDates;
select * from classes;
select * from subjects;
select * from classHours;

