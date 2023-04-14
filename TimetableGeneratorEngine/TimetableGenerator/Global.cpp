#include "Global.h"

std::unordered_map<std::string, Teacher>    g_teachers;
std::unordered_map<std::string, Location>   g_locations;
std::unordered_map<std::string, Class>      g_classes;
std::unordered_map<std::string, Subject>    g_subjects;
std::unordered_map<std::string, ClassHour>  g_classHours;
std::vector<std::string>  g_teacherIDs;
std::vector<std::string>  g_locationIDs;
std::vector<std::string>  g_classIDs;
std::vector<std::string>  g_subjectIDs;
std::vector<std::string>  g_classHourIDs;
int                     g_changeNumber;
int                     g_maxIteration;
double                  g_initialTemperature;
bool                    g_bActive;