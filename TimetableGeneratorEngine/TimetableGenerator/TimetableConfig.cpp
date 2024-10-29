#include "stdafx.h"
#include "TimetableConfig.h"

void TimetableConfig::ReadFromJson(const json& data)
{
    classCatalogOneTypeOfCourseOnADay = data["OneTypeOfCourseOnADayClass"].get<bool>();
    classCatalogCoursesStartsAtEight = data["ClassCoursesStartsAtEight"].get<bool>();
    classCatalogNoHoleHour = data["NoHoleHoursInClass"].get<bool>();
    classCatalogEvenHours = data["EvenHoursInClass"].get<bool>();
    teacherCatalogNoHoleHour = data["NoHoleHoursInTeacher"].get<bool>();
    teacherCatalogEvenHours = data["EvenHoursInTeacher"].get<bool>();
    classCatalogCoursesWeight = data["CoursesWeightInClass"].get<bool>();
}
