#include "stdafx.h"
#include <fstream>
#include <algorithm>
#include "Global.h"
#include "HelperFunctions.h"
#include <chrono>

using json = nlohmann::json;

void Read(std::string fileName) {
    std::ifstream fin(fileName);
    json data = json::parse(fin);
    g_changeNumber = data["ChangesNumber"];
    g_maxIteration = data["MaxIteration"];
    g_initialTemperature = data["InitialTemperature"];
    g_bClassCatalogOneTypeOfCourseOnADay = data["OneTypeOfCourseOnADayClass"].get<bool>();
    g_bClassCatalogCoursesStartsAtEight = data["ClassCoursesStartsAtEight"].get<bool>();
    g_bClassCatalogNoHoleHour = data["NoHoleHoursInClass"].get<bool>();
    g_bClassCatalogEvenHours = data["EvenHoursInClass"].get<bool>();
    g_bTeacherCatalogNoHoleHour = data["NoHoleHoursInTeacher"].get<bool>();
    g_bTeacherCatalogEvenHours = data["EvenHoursInTeacher"].get<bool>();
    g_bClassCatalogCoursesWeight = data["CoursesWeightInClass"].get<bool>();
    for (auto jsonTeacher : data["teachers"]) {
        g_teachers[jsonTeacher["_id"]] = Teacher{jsonTeacher};
    }
    for (auto jsonLocation : data["locations"]) {
        g_locations[jsonLocation["_id"]] = Location{jsonLocation};
    }
    for (auto jsonClass : data["classes"]) {
        g_classes[jsonClass["_id"]] = Class{jsonClass};
        g_classIDs.push_back(jsonClass["_id"]);
    }
    for (auto jsonSubject : data["subjects"]) {
        g_subjects[jsonSubject["_id"]] = Subject{jsonSubject};
    }
    for (auto jsonClassHour : data["classHours"]) {
        g_classHours[jsonClassHour["_id"]] = ClassHour{jsonClassHour};
    }
}

void InitCatalogs() {
    for (auto &classHour : g_classHours)
    {
        classHour.second.AddClassHoursToCatalog();
    }
}

double Fitness(std::unordered_map<std::string, Class> &p_classes, std::unordered_map<std::string, Teacher> &p_teachers, std::unordered_map<std::string, Location> &p_locations) {
    double fitnessValue = 0;
    for (auto &clas : p_classes)
    {
        fitnessValue += clas.second.GetFitnessValue();
    }
    for (auto &teacher : p_teachers)
    {
        fitnessValue += teacher.second.GetFitnessValue();
    }
    for (auto &location : p_locations)
    {
        fitnessValue += location.second.GetFitnessValue();
    }
    return fitnessValue;
}

double Fitness() {
    return Fitness(g_classes, g_teachers, g_locations);
}

void WriteCatalog() {
    json res, classCatalogs, teacherCatalogs, locationsCatalogs;
    for (auto clas : g_classes) {
        classCatalogs[clas.first] = clas.second.GetCatalog()->GetJSONObj();
    }
    for (auto teacher : g_teachers) {
        teacherCatalogs[teacher.first] = teacher.second.GetCatalog()->GetJSONObj();
    }
    for (auto location : g_locations) {
        locationsCatalogs[location.first] = location.second.GetCatalog()->GetJSONObj();
    }
    res["classCatalogs"] = classCatalogs;
    res["teacherCatalogs"] = teacherCatalogs;
    res["locationCatalogs"] = locationsCatalogs;
    std::cout << res;
}

bool ChangeLocations(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, std::string p_strLocationID, ClassHour p_classHour, int p_nDay, int p_nHour) {
    std::string classID = p_classHour.GetClassID();
    std::string oldLocationID = p_classes[classID].GetCatalog()->GetLocationID(p_nDay, p_nHour);
    std::string teacherID = p_classHour.GetTeacherID();
    if (!p_locations[p_strLocationID].GetCatalog()->IsFreeDay(p_nDay, p_nHour)) {
        return false;
    }
    p_locations[oldLocationID].DeleteClassHour(p_nDay, p_nHour);
    p_classes[classID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_nDay, p_nHour);
    p_teachers[teacherID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_nDay, p_nHour);
    p_locations[p_strLocationID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_nDay, p_nHour);
    return true;
}

void SwapLocations(std::unordered_map<std::string, Location>& p_locations, Class &p_class, int day1, int hour1, int day2, int hour2) {
    std::string strLocationID1 = p_class.GetLocationID(day1, hour1);
    std::string strLocationID2 = p_class.GetLocationID(day2, hour2);
    if (strLocationID1.compare("") != 0)
        p_locations[strLocationID1].Change(day1, hour1, day2, hour2);
    if (strLocationID2.compare("") != 0)
        p_locations[strLocationID2].Change(day1, hour1, day2, hour2);
}

void SwapTeachers(std::unordered_map<std::string, Teacher>& p_teachers, Class& p_class, int day1, int hour1, int day2, int hour2) {
    std::string strTeacherID1 = p_class.GetTeacherID(day1, hour1);
    std::string strTeacherID2 = p_class.GetTeacherID(day2, hour2);
    if (strTeacherID1.compare("") != 0)
        p_teachers[strTeacherID1].Change(day1, hour1, day2, hour2);
    if (strTeacherID2.compare("") != 0)
        p_teachers[strTeacherID2].Change(day1, hour1, day2, hour2);
}

std::string GetRandomClassID() {
    return g_classIDs[RandInt(0, int(g_classIDs.size() - 1))];
}

void Change(std::unordered_map<std::string, Class> &p_classes, std::unordered_map<std::string, Teacher> &p_teachers, std::unordered_map<std::string, Location> &p_locations) {
    std::string strClassID = "64345afe10265ba59827241e";//GetRandomClassID();
    int nDay1 = RandInt(0, 4);
    int nHour1 = RandInt(0, 7);
    int nDay2 = RandInt(0, 4);
    int nHour2 = RandInt(0, 7);
    
    ClassHour classHour1 = g_classHours[p_classes[strClassID].GetClassHourID(nDay1, nHour1)];
    ClassHour classHour2 = g_classHours[p_classes[strClassID].GetClassHourID(nDay2, nHour2)];

    std::string strSubjectID1 = classHour1.GetSubjectID();
    std::string strSubjectID2 = classHour2.GetSubjectID();
    
    if (g_subjects[strSubjectID1].HasLocations())      //change the location of a classhour
    {
        if (Rand() <= 0.05) {
            std::string locationID = g_subjects[strSubjectID1].GetRandomLocationID();
            if (ChangeLocations(p_classes, p_teachers, p_locations, locationID, classHour1, nDay1, nHour1))
                return;
        }
    }
    if (g_subjects[strSubjectID2].HasLocations())
    {
        if (Rand() <= 0.05) {
            std::string locationID = g_subjects[strSubjectID2].GetRandomLocationID();
            if (ChangeLocations(p_classes, p_teachers, p_locations, locationID, classHour2, nDay2, nHour2))
                return;
        }
    }

    SwapLocations(p_locations, p_classes[strClassID], nDay1, nHour1, nDay2, nHour2);

    SwapTeachers(p_teachers, p_classes[strClassID], nDay1, nHour1, nDay2, nHour2);

    p_classes[strClassID].Change(nDay1, nHour1, nDay2, nHour2);
}

void Changes(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    for (int i = 0; i < g_changeNumber; i++) {
        Change(p_classes, p_teachers, p_locations);
    }
}

double LinearAnnealing(int i) {
    return g_initialTemperature / (1 + 0.5 * i);
}

void SimulatedAnnealing() {
    std::unordered_map<std::string, Class> p_classesBest = g_classes;
    std::unordered_map<std::string, Teacher> p_teachersBest = g_teachers;
    std::unordered_map<std::string, Location> p_locationsBest = g_locations;
    std::unordered_map<std::string, Class> p_classes;
    std::unordered_map<std::string, Teacher> p_teachers;
    std::unordered_map<std::string, Location> p_locations;
    g_bActive = false;
    double t = g_initialTemperature;
    int i = 0;
    while (i < g_maxIteration && t > 0.00001) {
        p_classes = g_classes;
        p_teachers = g_teachers;
        p_locations = g_locations;
        Changes(p_classes, p_teachers, p_locations);
        double fitnessW = Fitness(p_classes, p_teachers, p_locations);
        double fitnessC = Fitness();
        if (fitnessW > fitnessC || Rand() < exp((fitnessW - fitnessC) / t)) {
            g_classes = p_classes;
            g_teachers = p_teachers;
            g_locations = p_locations;
        }
        i++;
        t = LinearAnnealing(i);
        if (Fitness() > Fitness(p_classesBest, p_teachersBest, p_locationsBest)) {
            p_classesBest = g_classes;
            p_teachersBest = g_teachers;
            p_locationsBest = g_locations;
        }
    }
    g_classes = p_classesBest;
    g_teachers = p_teachersBest;
    g_locations = p_locationsBest;
}

int main()
{
    Read("D:/Egyetem/Allamvizsga/university-timetable-generator/TimetableGeneratorEngine/TimetableGenerator/in.json");
    InitCatalogs();
    Fitness();
    //Fitness();
    //WriteCatalog();
    //std::cout << "-----------------------------------------" << std::endl;
    auto t_start = std::chrono::high_resolution_clock::now();
    SimulatedAnnealing();
    auto t_end = std::chrono::high_resolution_clock::now();
    WriteCatalog();
    double elapsed_time_ms = std::chrono::duration<double, std::milli>(t_end - t_start).count();
    //std::cout << std::endl << std::endl << "Elapsed time: " << elapsed_time_ms << " ms";
}