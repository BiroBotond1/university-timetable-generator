#include "stdafx.h"
#include "TimetableGenerator.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"
#include "ClassHour.h"
#include "Random.h"

void TimetableGenerator::Run()
{
#if _DEBUG
    std::string fileName = "../../TimetableGeneratorEngine/TimetableGenerator/in.json";
#else
    std::string fileName = "../TimetableGeneratorEngine/TimetableGenerator/in.json"; //called only from the webserver
#endif
    
    m_DB.Fill(fileName);
    InitCatalogs();
    SimulatedAnnealing();
    WriteCatalog();
}

void TimetableGenerator::InitCatalogs() 
{
    m_bActive = false;
    for (auto& classHour : m_DB.GetClassHours())
    {
        classHour.second->AddClassHoursToCatalog();
    }
}

void TimetableGenerator::SimulatedAnnealing() 
{   
    Database bestDB;
    m_DB.DeepCopy(bestDB);
    std::ofstream testDatas("Plot_data.txt");
    auto t_start = std::chrono::high_resolution_clock::now();
    double initialT = MAX_TEMP, t;
    t = initialT;
    int i = 0, nStepsWithNoBetterSolution = 0;
    while (/*nStepsWithNoBetterSolution < 10000*/t > MIN_TEMP/*g_bActive == false*/)
    {
        Database localDB;
        m_DB.DeepCopy(localDB);

        Changes(localDB);

        double fitnessW = Fitness(localDB);
        double fitnessC = Fitness();

        if (fitnessW > fitnessC || Random::Get() < exp((fitnessW - fitnessC) / t))
        {
            localDB.DeepCopy(m_DB);
        }

        i++;
        nStepsWithNoBetterSolution++;
        t = LinearAnnealing(initialT, i);

        if (Fitness() > Fitness(bestDB))
        {
            nStepsWithNoBetterSolution = 0;
            m_DB.DeepCopy(bestDB);
        }

        if (i % 1000 == 0)
        {
            auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(bestDB);
            testDatas << dFitnessClass << " " << dFitnessTeacher << " " << dFitnessLocation << " " << t << " \n";
        }

    }
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(bestDB);

    m_fitnessClass = dFitnessClass;
    m_fitnessTeacher = dFitnessTeacher;
    m_fitnessLocation = dFitnessLocation;

    auto t_act = std::chrono::high_resolution_clock::now();
    m_elapsedTime = std::chrono::duration<double>(t_act - t_start).count();
    testDatas.close();

    m_DB.DeepCopy(bestDB);
}

void TimetableGenerator::Changes(Database& p_db)
{
    for (int i = 0; i < 1; i++)
    {
        Change(p_db);
    }
}

void TimetableGenerator::Change(Database& p_db)
{
    auto clas = p_db.GetRandomClass();

    auto [time1, time2] = GetRandomFreeHourTime(clas, p_db.GetTeachers(), p_db.GetLocations());

    auto classHour1 = clas->GetCatalog().GetClassHour(time1);
    auto classHour2 = clas->GetCatalog().GetClassHour(time2);

    auto subject1 = classHour1 ? classHour1->GetSubject() : nullptr;
    auto subject2 = classHour2 ? classHour2->GetSubject() : nullptr;

    if (subject1 && subject1->HasLocations())      //change the location of a classhour
    {
        if (Random::Get() <= 0.05)
        {
            auto location = subject1->GetRandomLocation();
            if (ChangeLocations(classHour1, location, time1))
                return;
        }
    }

    if (subject2 && subject2->HasLocations())
    {
        if (Random::Get() <= 0.05)
        {
            auto location = subject2->GetRandomLocation();
            if (ChangeLocations(classHour2, location, time2))
                return;
        }
    }

    SwapLocations(clas, time1, time2);

    SwapTeachers(p_db.GetTeachers(), clas, time1, time2);

    clas->Change(time1, time2);
}

double TimetableGenerator::LinearAnnealing(double t, int i)
{
    return t / (1 + 0.1/*0.01*/ * i);
}

bool TimetableGenerator::ChangeLocations(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_time)
{
    auto clas = p_classHour->GetClass();
    auto oldLocation = clas->GetCatalog().GetLocation(p_time);
    auto teacher = p_classHour->GetTeacher();

    if (!p_location->GetCatalog().IsFreeDay(p_time))
    {
        return false;
    }

    oldLocation->DeleteClassHour(p_time);
    clas->SetClassHour(p_classHour, p_location, p_time);
    teacher->SetClassHour(p_classHour, p_location, p_time);
    p_location->SetClassHour(p_classHour, p_location, p_time);
    return true;
}

void TimetableGenerator::SwapLocations(std::shared_ptr<Class> p_class, Time p_time1, Time p_time2)
{
    auto location1 = p_class->GetCatalog().GetLocation(p_time1);
    auto location2 = p_class->GetCatalog().GetLocation(p_time2);
    if (location1)
        location1->Change(p_time1, p_time2);
    if (location2)
        location2->Change(p_time1, p_time2);
}

void TimetableGenerator::SwapTeachers(TeacherMap& p_teachers, std::shared_ptr<Class> p_class, Time p_time1, Time p_time2)
{
    auto teacher1 = p_class->GetTeacher(p_time1);
    auto teacher2 = p_class->GetTeacher(p_time2);
    if (teacher1)
        teacher1->Change(p_time1, p_time2);
    if (teacher2)
        teacher2->Change(p_time1, p_time2);
}

double TimetableGenerator::Fitness()
{
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(m_DB);
    m_bActive = bActive;
    return dFitnessClass + dFitnessTeacher + dFitnessLocation;
}

double TimetableGenerator::Fitness(Database& p_db)
{
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(p_db);
    return dFitnessClass + dFitnessTeacher + dFitnessLocation;
}

std::tuple<double, double, double, bool> TimetableGenerator::Evaluate(Database& p_db)
{
    double dFitnessValueClass = 0, dFitnessValueTeacher = 0, dFitnessValueLocation = 0;
    bool bActive = true;

    for (auto& clas : p_db.GetClasses())
    {
        auto [dActfitness, bActActive] = clas.second->Evaluate();
        dFitnessValueClass += dActfitness;
        bActive = bActive && bActActive;
    }
    
    for (auto& teacher : p_db.GetTeachers())
    {
        auto [dActfitness, bActActive] = teacher.second->Evaluate();
        dFitnessValueTeacher += dActfitness;
        bActive = bActive && bActActive;
    }

    for (auto& location : p_db.GetLocations())
    {
        auto [dActfitness, bActActive] = location.second->Evaluate();
        dFitnessValueLocation += dActfitness;
        bActive = bActive && bActActive;
    }

    return std::make_tuple(dFitnessValueClass, dFitnessValueTeacher, dFitnessValueLocation, bActive);
}

std::tuple<Time, Time> TimetableGenerator::GetRandomFreeHourTime(std::shared_ptr<Class> p_class, TeacherMap& p_teachers, LocationMap& p_locations) 
{
    Time time1, time2;
    std::shared_ptr<Teacher> teacher1;
    std::shared_ptr<Teacher> teacher2;
    std::shared_ptr<Location> location1;
    std::shared_ptr<Location> location2;
    do {
        time1 = Time{ Random::GetInt(0, 4), Random::GetInt(0, 7) };
        time2 = Time{ Random::GetInt(0, 4), Random::GetInt(0, 7) };
        teacher1 = p_class->GetTeacher(time1);
        teacher2 = p_class->GetTeacher(time2);
        location1 = p_class->GetCatalog().GetLocation(time1);
        location2 = p_class->GetCatalog().GetLocation(time2);
    } while ((teacher1 && !teacher1->GetCatalog().IsFreeDay(time2))
        || (teacher2 && !teacher2->GetCatalog().IsFreeDay(time1))
        || (location1 && !location1->GetCatalog().IsFreeDay(time2))
        || (location2 && !location2->GetCatalog().IsFreeDay(time1))
        || (!teacher1 && !teacher2));

    return std::make_tuple(time1, time2);
}

void TimetableGenerator::WriteCatalog()
{
    json res = m_DB.WriteCatalog();

    res["active"] = m_bActive;
    res["fitnesClas"] = m_fitnessClass;
    res["fitnesTeacher"] = m_fitnessTeacher;
    res["fitnesLocation"] = m_fitnessLocation;
    res["elapsedTime"] = m_elapsedTime;
    std::cout << res;
}