#pragma once
#include "stdafx.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"
#include "ClassHour.h"

extern std::vector<Teacher>    g_teachers;
extern std::vector<Location>   g_locations;
extern std::vector<Class>      g_classes;
extern std::vector<Subject>    g_subjects;
extern std::vector<ClassHour>  g_classHours;
extern int                     g_changeNumber;
extern int                     g_maxIteration;
extern double                  g_initialTemperature;
extern bool                    g_bActive;