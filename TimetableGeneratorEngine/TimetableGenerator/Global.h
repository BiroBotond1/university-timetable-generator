#pragma once
#include "stdafx.h"
#include "Group.h"
#include "SubCourse.h"
#include "Catalog.h"
#include "Course.h"
#include "Major.h"
#include "Teacher.h"
#include "Location.h"

extern std::vector<Major>      g_majors;
extern std::vector<Location>   g_locations;
extern std::vector<Teacher>    g_teachers;
extern std::vector<Course>     g_courses;
extern std::vector<SubCourse>  g_subCourses;
extern std::vector<Group>      g_groupes;;
extern int                     g_changeNumber;
extern int                     g_maxIteration;
extern int                     g_courseNumber;
extern double                  g_initialTemperature;
extern bool                    g_bActive;