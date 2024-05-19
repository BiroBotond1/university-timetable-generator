#include "TimetableGenerator.h"

void TimetableGenerator::Read(std::string fileName) {
    std::ifstream fin(fileName);
    json data = json::parse(fin);
    g_bClassCatalogOneTypeOfCourseOnADay = data["OneTypeOfCourseOnADayClass"].get<bool>();
    g_bClassCatalogCoursesStartsAtEight = data["ClassCoursesStartsAtEight"].get<bool>();
    g_bClassCatalogNoHoleHour = data["NoHoleHoursInClass"].get<bool>();
    g_bClassCatalogEvenHours = data["EvenHoursInClass"].get<bool>();
    g_bTeacherCatalogNoHoleHour = data["NoHoleHoursInTeacher"].get<bool>();
    g_bTeacherCatalogEvenHours = data["EvenHoursInTeacher"].get<bool>();
    g_bClassCatalogCoursesWeight = data["CoursesWeightInClass"].get<bool>();
    for (auto &jsonTeacher : data["teachers"]) {
        g_teachers[jsonTeacher["_id"]] = Teacher{ jsonTeacher };
    }
    for (auto &jsonLocation : data["locations"]) {
        g_locations[jsonLocation["_id"]] = Location{ jsonLocation };
    }
    for (auto &jsonClass : data["classes"]) {
        g_classes[jsonClass["_id"]] = Class{ jsonClass };
        g_classIDs.push_back(jsonClass["_id"]);
    }
    for (auto &jsonSubject : data["subjects"]) {
        g_subjects[jsonSubject["_id"]] = Subject{ jsonSubject };
    }
    for (auto &jsonClassHour : data["classHours"]) {
        g_classHours[jsonClassHour["_id"]] = ClassHour{ jsonClassHour };
    }
}

void TimetableGenerator::InitCatalogs() {
    m_bActive = false;
    for (auto& classHour : g_classHours)
    {
        classHour.second.AddClassHoursToCatalog();
    }
}

double TimetableGenerator::Fitness(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(p_classes, p_teachers, p_locations);
    return dFitnessClass + dFitnessTeacher + dFitnessLocation;
}

std::tuple<double, double, double, bool> TimetableGenerator::Evaluate(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    double dFitnessValueClass = 0, dFitnessValueTeacher = 0, dFitnessValueLocation = 0;
    bool bActive = true;
    for (auto& clas : p_classes)
    {
        auto [dActfitness, bActActive] = clas.second.EvaluateClass();
        dFitnessValueClass += dActfitness;
        bActive = bActive && bActActive;
    }
    
    for (auto& teacher : p_teachers)
    {
        auto [dActfitness, bActActive] = teacher.second.EvaluateTeacher(teacher.first);
        dFitnessValueTeacher += dActfitness;
        bActive = bActive && bActActive;
    }
    for (auto& location : p_locations)
    {
        auto [dActfitness, bActActive] = location.second.EvaluateLocation(location.first);
        dFitnessValueLocation += dActfitness;
        bActive = bActive && bActActive;
    }
    return std::make_tuple(dFitnessValueClass, dFitnessValueTeacher, dFitnessValueLocation, bActive);
}

double TimetableGenerator::Fitness() {
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(g_classes, g_teachers, g_locations);
    m_bActive = bActive;
    return dFitnessClass + dFitnessTeacher + dFitnessLocation;
}

void TimetableGenerator::WriteCatalog() {
    json res, classCatalogs, teacherCatalogs, locationsCatalogs;
    for (auto& clas : g_classes) {
        classCatalogs[clas.first] = clas.second.GetCatalog().GetJSONObj();
    }
    for (auto& teacher : g_teachers) {
        teacherCatalogs[teacher.first] = teacher.second.GetCatalog().GetJSONObj();
    }
    for (auto& location : g_locations) {
        locationsCatalogs[location.first] = location.second.GetCatalog().GetJSONObj();
    }
    res["classCatalogs"] = classCatalogs;
    res["teacherCatalogs"] = teacherCatalogs;
    res["locationCatalogs"] = locationsCatalogs;
    res["active"] = m_bActive;
    res["fitnesClas"] = m_fitnessClass;
    res["fitnesTeacher"] = m_fitnessTeacher;
    res["fitnesLocation"] = m_fitnessLocation;
    res["elapsedTime"] = m_elapsedTime;
    std::cout << res;
}

bool TimetableGenerator::ChangeLocations(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, std::string p_strLocationID, ClassHour p_classHour, Time p_time) {
    std::string classID = p_classHour.GetClassID();
    std::string oldLocationID = p_classes[classID].GetCatalog().GetLocationID(p_time);
    std::string teacherID = p_classHour.GetTeacherID();
    if (!p_locations[p_strLocationID].GetCatalog().IsFreeDay(p_time)) {
        return false;
    }
    p_locations[oldLocationID].DeleteClassHour(p_time);
    p_classes[classID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_time);
    p_teachers[teacherID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_time);
    p_locations[p_strLocationID].SetClassHour(p_classHour.GetID(), p_strLocationID, p_time);
    return true;
}

void TimetableGenerator::SwapLocations(std::unordered_map<std::string, Location>& p_locations, Class& p_class, Time p_time1, Time p_time2) {
    std::string strLocationID1 = p_class.GetLocationID(p_time1);
    std::string strLocationID2 = p_class.GetLocationID(p_time2);
    if (strLocationID1.compare("") != 0)
        p_locations[strLocationID1].Change(p_time1, p_time2);
    if (strLocationID2.compare("") != 0)
        p_locations[strLocationID2].Change(p_time1, p_time2);
}

void TimetableGenerator::SwapTeachers(std::unordered_map<std::string, Teacher>& p_teachers, Class& p_class, Time p_time1, Time p_time2) {
    std::string strTeacherID1 = p_class.GetTeacherID(p_time1);
    std::string strTeacherID2 = p_class.GetTeacherID(p_time2);
    if (strTeacherID1.compare("") != 0)
        p_teachers[strTeacherID1].Change(p_time1, p_time2);
    if (strTeacherID2.compare("") != 0)
        p_teachers[strTeacherID2].Change(p_time1, p_time2);
}

std::string TimetableGenerator::GetRandomClassID() {
    return g_classIDs[RandInt(0, int(g_classIDs.size() - 1))];
}

std::tuple<Time, Time> TimetableGenerator::GetRandomFreeHourTime(std::string p_strtClassID, std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    Time time1, time2;
    std::string strTeacherID1;
    std::string strTeacherID2;
    std::string strLocationID1;
    std::string strLocationID2;
    do {
        time1 = Time{ RandInt(0, 4), RandInt(0, 7) };
        time2 = Time{ RandInt(0, 4), RandInt(0, 7) };
        strTeacherID1 = p_classes[p_strtClassID].GetTeacherID(time1);
        strTeacherID2 = p_classes[p_strtClassID].GetTeacherID(time2);
        strLocationID1 = p_classes[p_strtClassID].GetLocationID(time1);
        strLocationID2 = p_classes[p_strtClassID].GetLocationID(time2);
    } while ((strTeacherID1.compare("") != 0 && !p_teachers[strTeacherID1].GetCatalog().IsFreeDay(time2)) 
        || (strTeacherID2.compare("") != 0 && !p_teachers[strTeacherID2].GetCatalog().IsFreeDay(time1))
        || (strLocationID1.compare("") != 0 && !p_locations[strLocationID1].GetCatalog().IsFreeDay(time2))
        || (strLocationID2.compare("") != 0 && !p_locations[strLocationID2].GetCatalog().IsFreeDay(time1))
        || (strTeacherID1.compare("") == 0 && strTeacherID2.compare("") == 0));

    return std::make_tuple(time1, time2);
}

void TimetableGenerator::Change(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    std::string strClassID = GetRandomClassID(); 
    auto [time1, time2] = GetRandomFreeHourTime(strClassID, p_classes, p_teachers, p_locations);

    ClassHour classHour1 = g_classHours[p_classes[strClassID].GetClassHourID(time1)];
    ClassHour classHour2 = g_classHours[p_classes[strClassID].GetClassHourID(time2)];

    std::string strSubjectID1 = classHour1.GetSubjectID();
    std::string strSubjectID2 = classHour2.GetSubjectID();

    if (g_subjects[strSubjectID1].HasLocations())      //change the location of a classhour
    {
        if (Rand() <= 0.05) {
            std::string locationID = g_subjects[strSubjectID1].GetRandomLocationID();
            if (ChangeLocations(p_classes, p_teachers, p_locations, locationID, classHour1, time1))
                return;
        }
    }
    if (g_subjects[strSubjectID2].HasLocations())
    {
        if (Rand() <= 0.05) {
            std::string locationID = g_subjects[strSubjectID2].GetRandomLocationID();
            if (ChangeLocations(p_classes, p_teachers, p_locations, locationID, classHour2, time2))
                return;
        }
    }

    SwapLocations(p_locations, p_classes[strClassID], time1, time2);

    SwapTeachers(p_teachers, p_classes[strClassID], time1, time2);

    p_classes[strClassID].Change(time1, time2);
}

void TimetableGenerator::Changes(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations) {
    for (int i = 0; i < 1; i++) {
        Change(p_classes, p_teachers, p_locations);
    }
}

double TimetableGenerator::LinearAnnealing(double t, int i) {
    return t / (1 + 0.01 * i);
}

void TimetableGenerator::SimulatedAnnealing() {
    std::unordered_map<std::string, Class> p_classesBest = g_classes;
    std::unordered_map<std::string, Teacher> p_teachersBest = g_teachers;
    std::unordered_map<std::string, Location> p_locationsBest = g_locations;
    std::unordered_map<std::string, Class> p_classes;
    std::unordered_map<std::string, Teacher> p_teachers;
    std::unordered_map<std::string, Location> p_locations;
    std::ofstream testDatas("Plot_data.txt");
    auto t_start = std::chrono::high_resolution_clock::now();
    double initialT = 200000, t;
    t = initialT;
    int i = 0, nStepsWithNoBetterSolution = 0;
    while (/*nStepsWithNoBetterSolution < 10000*/t > 2/*g_bActive == false*/) {
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
        nStepsWithNoBetterSolution++;
        t = LinearAnnealing(initialT, i);
        if (Fitness() > Fitness(p_classesBest, p_teachersBest, p_locationsBest)) {
            nStepsWithNoBetterSolution = 0;
            p_classesBest = g_classes;
            p_teachersBest = g_teachers;
            p_locationsBest = g_locations;
        }
        if (i % 1000 == 0) {
            auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(p_classesBest, p_teachersBest, p_locationsBest);
            testDatas << dFitnessClass << " " << dFitnessTeacher << " " << dFitnessLocation << " " << t << " ";
        }
        
    }
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(p_classesBest, p_teachersBest, p_locationsBest);
    m_fitnessClass = dFitnessClass;
    m_fitnessTeacher = dFitnessTeacher;
    m_fitnessLocation = dFitnessLocation;
    auto t_act = std::chrono::high_resolution_clock::now();
    m_elapsedTime = std::chrono::duration<double>(t_act - t_start).count();
    testDatas.close();

    g_classes = p_classesBest;
    g_teachers = p_teachersBest;
    g_locations = p_locationsBest;
}