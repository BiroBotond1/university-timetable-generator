#include "stdafx.h"
#include <fstream>
#include <algorithm>
#include "Global.h"
#include "HelperFunctions.h"
#include <chrono>

using json = nlohmann::json;

//std::ofstream std::cout("D:/Egyetem/Allamvizsga/university-timetable-generator/TimetableGeneratorEngine/TimetableGenerator/output.txt");

void Read(std::string fileName) {
    std::ifstream fin(fileName);
    json data = json::parse(fin);
    g_changeNumber = data["ChangesNumber"];
    g_maxIteration = data["MaxIteration"];
    g_initialTemperature = data["InitialTemperature"];
    for (auto jsonTeacher : data["teachers"]) {
        g_teachers[jsonTeacher["_id"]] = Teacher{jsonTeacher};
        g_teacherIDs.push_back(jsonTeacher["_id"]);
    }
    for (auto jsonLocation : data["locations"]) {
        g_locations[jsonLocation["_id"]] = Location{jsonLocation};
        g_locationIDs.push_back(jsonLocation["_id"]);
    }
    for (auto jsonClass : data["classes"]) {
        g_classes[jsonClass["_id"]] = Class{jsonClass};
        g_classIDs.push_back(jsonClass["_id"]);
    }
    for (auto jsonSubject : data["subjects"]) {
        g_subjects[jsonSubject["_id"]] = Subject{jsonSubject};
        g_subjectIDs.push_back(jsonSubject["_id"]);
    }
    for (auto jsonClassHour : data["classHours"]) {
        g_classHours[jsonClassHour["_id"]] = ClassHour{jsonClassHour};
        g_classHourIDs.push_back(jsonClassHour["_id"]);
    }
}

void InitCatalogs() {
    for (auto classHour : g_classHours)
    {
        classHour.second.AddClassHoursToCatalog();
    }
}

double Fitness(std::unordered_map<std::string, Class> p_classes, std::unordered_map<std::string, Teacher> p_teachers, std::unordered_map<std::string, Location> p_locations) {
    double fitnessValue = 0;
    for (auto clas : p_classes)
    {
        fitnessValue += clas.second.GetFitnessValue();
    }
    for (auto teacher : p_teachers)
    {
        fitnessValue += teacher.second.GetFitnessValue();
    }
    for (auto location : p_locations)
    {
        fitnessValue += location.second.GetFitnessValue();
    }
    return fitnessValue;
}

double Fitness() {
    return Fitness(g_classes, g_teachers, g_locations);
}

void WriteCatalog() {
    std::ofstream fout("out.json");
    json res, classCatalogs, teacherCatalogs, locationsCatalogs;
    for (auto clas : g_classes) {
        classCatalogs[clas.first] = clas.second.GetCatalog().GetJSONObj();
    }
    for (auto teacher : g_teachers) {
        teacherCatalogs[teacher.first] = teacher.second.GetCatalog().GetJSONObj();
    }
    for (auto location : g_locations) {
        locationsCatalogs[location.first] = location.second.GetCatalog().GetJSONObj();
    }
    res["classCatalogs"] = classCatalogs;
    res["teacherCatalogs"] = teacherCatalogs;
    res["locationCatalogs"] = locationsCatalogs;
    fout << res;
    //g_classes["64345afe10265ba59827241e"].GetCatalog().Write();
   // g_teachers[0].GetCatalog().Write();
}


void ChangeLocation(std::unordered_map<std::string, Location>& p_locations, Class &p_class, int day1, int hour1, int day2, int hour2) {
    std::string strLocationID1 = p_class.GetLocationID(day1, hour1);
    std::string strLocationID2 = p_class.GetLocationID(day2, hour2);
    if (strLocationID1.compare("") != 0)
        p_locations[strLocationID1].Change(day1, hour1, day2, hour2);
    if (strLocationID2.compare("") != 0)
        p_locations[strLocationID2].Change(day1, hour1, day2, hour2);
}

void ChangeTeachers(std::unordered_map<std::string, Teacher>& p_teachers, Class& p_class, int day1, int hour1, int day2, int hour2) {
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
    
    std::string strSubjectID1 = g_classHours[p_classes[strClassID].GetClassHourID(nDay1, nHour1)].GetSubjectID();
    std::string strSubjectID2 = g_classHours[p_classes[strClassID].GetClassHourID(nDay2, nHour2)].GetSubjectID();
    
    /*if (g_subjects[strSubjectID1].HasLocations())      //change the location of a classhour
    {
        if (Rand() <= 0.2) {
            std::string locationID = g_subjects[strSubjectID1].GetRandomLocationID();
        }
    }
    if (g_subjects[strSubjectID2].HasLocations())
    {
        if (Rand() <= 0.2) {
            std::string locationID = g_subjects[strSubjectID2].GetRandomLocationID();
        }
    }*/

    ChangeLocation(p_locations, p_classes[strClassID], nDay1, nHour1, nDay2, nHour2);

    ChangeTeachers(p_teachers, p_classes[strClassID], nDay1, nHour1, nDay2, nHour2);

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
    //Read("D:/Egyetem/Allamvizsga/university-timetable-generator/TimetableGeneratorEngine/TimetableGenerator/in.json");
    Read("in.json");
    InitCatalogs();
    Fitness();
    WriteCatalog();
    std::cout << "-----------------------------------------" << std::endl;
    auto t_start = std::chrono::high_resolution_clock::now();
    SimulatedAnnealing();
    auto t_end = std::chrono::high_resolution_clock::now();
    WriteCatalog();
    double elapsed_time_ms = std::chrono::duration<double, std::milli>(t_end - t_start).count();
    std::cout << std::endl << std::endl << "Elapsed time: " << elapsed_time_ms << " ms";
}