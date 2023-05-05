#include "Global.h"

std::unordered_map<std::string, Teacher>    g_teachers;
std::unordered_map<std::string, Location>   g_locations;
std::unordered_map<std::string, Class>      g_classes;
std::unordered_map<std::string, Subject>    g_subjects;
std::unordered_map<std::string, ClassHour>  g_classHours;
std::vector<std::string>					g_classIDs;
int											g_changeNumber;
int											g_maxIteration;
double										g_initialTemperature;
bool										g_bActive;
bool										g_bTeacherCatalogEvenHours;
bool										g_bTeacherCatalogNoHoleHour;
bool										g_bClassCatalogEvenHours;
bool										g_bClassCatalogNoHoleHour;
bool										g_bClassCatalogOneTypeOfCourseOnADay;
bool										g_bClassCatalogCoursesStartsAtEight;
bool										g_bClassCatalogCoursesWeight;