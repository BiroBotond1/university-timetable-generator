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
    for (auto jsonTeacher : data["Teachers"]) {
        g_teachers.push_back(Teacher{ jsonTeacher });
    }
    for (auto jsonLocation : data["Locations"]) {
        g_locations.push_back(Location{ jsonLocation });
    }
    for (auto jsonClass : data["Classes"]) {
        g_classes.push_back(Class{ jsonClass });
    }
    for (auto jsonSubject : data["Subjects"]) {
        g_subjects.push_back(Subject{ jsonSubject });
    }
    for (auto jsonClassHour : data["ClassHours"]) {
        g_classHours.push_back(ClassHour{ jsonClassHour });
    }
}

void InitCatalogs() {
    int i = 0;
    for (auto classHour : g_classHours)
    {
        classHour.AddClassHoursToCatalog(i);
        i++;
    }
}

double Fitness(std::vector<Class> p_classes, std::vector<Teacher> p_teachers, std::vector<Location> p_locations) {
    double fitnessValue = 0;
    for (auto clas : p_classes)
    {
        fitnessValue += clas.GetFitnessValue();
    }
    for (auto teacher : p_teachers)
    {
        fitnessValue += teacher.GetCatalog().GetFitnessValue();
    }
    for (auto location : p_locations)
    {
        fitnessValue += location.GetCatalog().GetFitnessValue();
    }
    return fitnessValue;
}

double Fitness() {
    return Fitness(g_classes, g_teachers, g_locations);
}

void ChangeLocation(std::vector<Location>& p_locations, Class &p_class, int day1, int hour1, int day2, int hour2) {
    int locationID1 = p_class.GetTeacherID(day1, hour1);
    int locationID2 = p_class.GetLocationID(day2, hour2);
    if (locationID1 != -1)
        p_locations[locationID1].Change(day1, hour1, day2, hour2);
    if (locationID2 != -1)
        p_locations[locationID2].Change(day1, hour1, day2, hour2);
}

void ChangeTeachers(std::vector<Teacher>& p_teachers, Class& p_class, int day1, int hour1, int day2, int hour2) {
    int teacherID1 = p_class.GetTeacherID(day1, hour1);
    int teacherID2 = p_class.GetTeacherID(day2, hour2);
    if (teacherID1 != -1)
        p_teachers[teacherID1].Change(day1, hour1, day2, hour2);
    if (teacherID2 != -1)
        p_teachers[teacherID2].Change(day1, hour1, day2, hour2);
}

void Change(std::vector<Class> &p_classes, std::vector<Teacher> &p_teachers, std::vector<Location> &p_locations) {
    int classID = RandInt(0, int(p_classes.size() - 1));
    int day1 = RandInt(0, 4);
    int hour1 = RandInt(0, 7);
    int day2 = RandInt(0, 4);
    int hour2 = RandInt(0, 7);

    /*int subjectID1 = g_classHours[p_classes[classID].GetClassHourID(day1, hour1)].GetSubjectID();
    int subjectID2 = g_classHours[p_classes[classID].GetClassHourID(day2, hour2)].GetSubjectID();
    if (g_subjects[subjectID1].HasLocations())      //change the location of a classhour
    {
        if (Rand() <= 0.2) {
            int locationID = g_subjects[subjectID1].GetRandomLocationID();
        }
    }
    if (g_subjects[subjectID2].HasLocations())
    {
        if (Rand() <= 0.2) {
            int locationID = g_subjects[subjectID2].GetRandomLocationID();
        }
    }*/

    p_classes[classID].Change(day1, hour1, day2, hour2);

    ChangeLocation(p_locations, p_classes[classID], day1, hour1, day2, hour2);

    ChangeTeachers(p_teachers, p_classes[classID], day1, hour1, day2, hour2);
}

void Changes(std::vector<Class>& p_classes, std::vector<Teacher>& p_teachers, std::vector<Location>& p_locations) {
    for (int i = 0; i < g_changeNumber; i++) {
        Change(p_classes, p_teachers, p_locations);
    }
}

double LinearAnnealing(int i) {
    return g_initialTemperature / (1 + 0.5 * i);
}

void WriteCatalog() {
    g_classes[0].GetCatalog().Write();
    g_teachers[0].GetCatalog().Write();
}

void SimulatedAnnealing() {
    std::vector<Class> p_classesBest = g_classes;
    std::vector<Teacher> p_teachersBest = g_teachers;
    std::vector<Location> p_locationsBest = g_locations;
    std::vector<Class> p_classes;
    std::vector<Teacher> p_teachers;
    std::vector<Location> p_locations;
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
    Read("input.json");
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