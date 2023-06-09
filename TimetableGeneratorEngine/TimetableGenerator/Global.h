#pragma once
#include "stdafx.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"
#include "ClassHour.h"

#define DAY_COUNT 5
#define HOUR_COUNT 8
#define START_HOUR 8

extern std::unordered_map<std::string, Teacher>		g_teachers;
extern std::unordered_map<std::string, Location>	g_locations;
extern std::unordered_map<std::string, Class>		g_classes;
extern std::unordered_map<std::string, Subject>		g_subjects;
extern std::unordered_map<std::string, ClassHour>	g_classHours;
extern std::vector<std::string>						g_classIDs; 
extern bool											g_bTeacherCatalogEvenHours;
extern bool											g_bTeacherCatalogNoHoleHour;
extern bool											g_bClassCatalogEvenHours;
extern bool											g_bClassCatalogNoHoleHour;
extern bool											g_bClassCatalogOneTypeOfCourseOnADay;
extern bool											g_bClassCatalogCoursesStartsAtEight;
extern bool											g_bClassCatalogCoursesWeight;