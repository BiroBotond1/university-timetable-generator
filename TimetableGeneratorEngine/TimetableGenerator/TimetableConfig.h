#pragma once

using json = nlohmann::json;

class TimetableConfig 
{
public:
    void ReadFromJson(const json& data);

public:
    bool teacherCatalogEvenHours = false;
    bool teacherCatalogNoHoleHour = false;
    bool classCatalogEvenHours = false;
    bool classCatalogNoHoleHour = false;
    bool classCatalogOneTypeOfCourseOnADay = false;
    bool classCatalogCoursesStartsAtEight = false;
    bool classCatalogCoursesWeight = false;

    double ensureCorrectCatalogValue = 1000.0;
    double inactiveDaysPenalty = -10.0;
    double noHoleHoursPenalty = -4;
};
