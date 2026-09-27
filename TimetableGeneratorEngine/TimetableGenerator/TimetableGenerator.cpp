#include "stdafx.h"
#include "TimetableGenerator.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"
#include "ClassHour.h"
#include "Random.h"
#include "GenerationError.h"
#include "GenerationCancelled.h"
#include <limits>

namespace
{
    void ThrowIfCancelled(const std::atomic<bool>& p_cancelled)
    {
        if (p_cancelled)
            throw GenerationCancelled();
    }

    struct WeeklyHours
    {
        std::unordered_map<std::string, int> mByTeacher;
        std::unordered_map<std::string, int> mByClass;
    };

    WeeklyHours CountWeeklyHours(Database& p_db)
    {
        WeeklyHours weeklyHours;
        for (const auto& [id, classHour] : p_db.GetClassHours())
        {
            weeklyHours.mByTeacher[classHour->GetTeacher()->GetId()] += classHour->GetNumber();
            weeklyHours.mByClass[classHour->GetClass()->GetId()] += classHour->GetNumber();
        }
        return weeklyHours;
    }

    std::string CouldNotPlace(const ClassHour& p_classHour, int p_nAttempts)
    {
        auto subject = p_classHour.GetSubject();
        std::string freeTogether = subject->HasLocations()
            ? "the class, the teacher and one of the subject's rooms are all free"
            : "the class and the teacher are both free";

        return "Could not place " + subject->GetName() + " for " + p_classHour.GetClass()->GetName()
            + " with " + p_classHour.GetTeacher()->GetName() + " after " + std::to_string(p_nAttempts)
            + " attempts: no slot where " + freeTogether + ".";
    }
}

std::string TimetableGenerator::Run(const std::string& input)
{
    const std::atomic<bool> notCancelled{ false };
    return Run(input, notCancelled);
}

std::string TimetableGenerator::Run(const std::string& input, const std::atomic<bool>& p_cancelled)
{
    m_DB.Fill(input);
    CheckWeeklyHours();
    InitLinearAnnealingParameter();
    InitCatalogs(input, p_cancelled);
    SimulatedAnnealing(p_cancelled);
    return WriteCatalog();
}

void TimetableGenerator::InitLinearAnnealingParameter() 
{
    m_linearAnnealing = m_DB.GetClasses().size() <= 14 ? 0.1 : 0.01; //set the linear anneling parameter smaller for bigger schools to be able to get a correct solution
}

//these inputs fail on every placement attempt whatever the order, and here the message can name
//the exact excess instead of whichever hour happened to be left over
void TimetableGenerator::CheckWeeklyHours()
{
    const int nWeekSlots = DAY_COUNT * HOUR_COUNT;
    auto weeklyHours = CountWeeklyHours(m_DB);

    int nTotalHours = 0;
    for (const auto& [classId, nHours] : weeklyHours.mByClass)
        nTotalHours += nHours;

    if (nTotalHours == 0)
        throw GenerationError("There are no class hours to schedule.");

    for (const auto& [classId, nHours] : weeklyHours.mByClass)
    {
        if (nHours > nWeekSlots)
            throw GenerationError("Class " + m_DB.GetClasses().at(classId)->GetName() + " needs "
                + std::to_string(nHours) + " hours, the week has " + std::to_string(nWeekSlots) + ".");
    }

    for (const auto& [teacherId, nHours] : weeklyHours.mByTeacher)
    {
        if (nHours > nWeekSlots)
            throw GenerationError("Teacher " + m_DB.GetTeachers().at(teacherId)->GetName() + " needs "
                + std::to_string(nHours) + " hours, the week has " + std::to_string(nWeekSlots) + ".");
    }
}

//hours are placed one at a time without backtracking, so even a schedulable school can run into
//a dead end; a fresh database and a different order usually get past it
void TimetableGenerator::InitCatalogs(const std::string& p_input, const std::atomic<bool>& p_cancelled)
{
    m_bActive = false;
    for (int nAttempt = 1; ; nAttempt++)
    {
        ThrowIfCancelled(p_cancelled);

        auto unplaced = PlaceClassHours();
        if (!unplaced)
            return;

        if (nAttempt == INIT_ATTEMPTS)
            throw GenerationError(CouldNotPlace(*unplaced, INIT_ATTEMPTS));

        m_DB = Database();
        m_DB.Fill(p_input);
    }
}

//most constrained first: hours that need a room, then the busiest teachers and classes, then the
//longest entries; the random last key gives every attempt a different order among equals
std::shared_ptr<ClassHour> TimetableGenerator::PlaceClassHours()
{
    auto weeklyHours = CountWeeklyHours(m_DB);

    using PlacementKey = std::tuple<bool, int, int, int, int>;
    std::vector<std::pair<PlacementKey, std::shared_ptr<ClassHour>>> vOrder;
    for (const auto& [id, classHour] : m_DB.GetClassHours())
    {
        PlacementKey key{ classHour->HasLocation(),
            weeklyHours.mByTeacher[classHour->GetTeacher()->GetId()],
            weeklyHours.mByClass[classHour->GetClass()->GetId()],
            classHour->GetNumber(),
            Random::GetInt(0, std::numeric_limits<int>::max()) };
        vOrder.emplace_back(key, classHour);
    }

    std::sort(vOrder.begin(), vOrder.end(), [](const auto& a, const auto& b) { return a.first > b.first; });

    for (const auto& [key, classHour] : vOrder)
    {
        if (!classHour->AddClassHoursToCatalog())
            return classHour;
    }
    return nullptr;
}

void TimetableGenerator::SimulatedAnnealing(const std::atomic<bool>& p_cancelled)
{
    Database bestDB;
    m_DB.DeepCopy(bestDB);

    auto t_start = std::chrono::high_resolution_clock::now();
    double initialT = MAX_TEMP, t;
    t = initialT;
    int i = 0, nStepsWithNoBetterSolution = 0;
    while (t > MIN_TEMP)
    {
        ThrowIfCancelled(p_cancelled);

        double fitnessC = Fitness();

        Database localDB;
        m_DB.DeepCopy(localDB);

        if (!Changes(localDB))
            break;      //no class has a valid swap, so no move can change the timetable any more

        double fitnessW = Fitness(localDB);

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
    }
    auto [dFitnessClass, dFitnessTeacher, dFitnessLocation, bActive] = Evaluate(bestDB);

    m_fitnessClass = dFitnessClass;
    m_fitnessTeacher = dFitnessTeacher;
    m_fitnessLocation = dFitnessLocation;

    auto t_act = std::chrono::high_resolution_clock::now();
    m_elapsedTime = std::chrono::duration<double>(t_act - t_start).count();

    m_DB.DeepCopy(bestDB);
}

bool TimetableGenerator::Changes(Database& p_db)
{
    for (int i = 0; i < 1; i++)
    {
        if (!Change(p_db))
            return false;
    }
    return true;
}

bool TimetableGenerator::Change(Database& p_db)
{
    auto clas = p_db.GetRandomClass();
    std::optional<std::tuple<Time, Time>> freeHourTimes;
    if (clas)
        freeHourTimes = GetRandomFreeHourTime(clas);

    //the drawn class has no valid swap, which is rare; any class that still has one will do
    if (!freeHourTimes)
    {
        for (auto& [id, otherClass] : p_db.GetClasses())
        {
            freeHourTimes = GetRandomFreeHourTime(otherClass);
            if (freeHourTimes)
            {
                clas = otherClass;
                break;
            }
        }
    }

    if (!freeHourTimes)
        return false;

    auto [time1, time2] = *freeHourTimes;

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
                return true;
        }
    }

    if (subject2 && subject2->HasLocations())
    {
        if (Random::Get() <= 0.05)
        {
            auto location = subject2->GetRandomLocation();
            if (ChangeLocations(classHour2, location, time2))
                return true;
        }
    }

    SwapLocations(clas, time1, time2);

    SwapTeachers(clas, time1, time2);

    clas->Change(time1, time2);
    return true;
}

double TimetableGenerator::LinearAnnealing(double t, int i)
{
    return t / (1 + m_linearAnnealing * i);
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

void TimetableGenerator::SwapTeachers(std::shared_ptr<Class> p_class, Time p_time1, Time p_time2)
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

//lists every valid swap instead of drawing random pairs until one is valid, so a class with no
//valid swap (no hours, or every teacher busy wherever it could move) no longer loops forever
std::optional<std::tuple<Time, Time>> TimetableGenerator::GetRandomFreeHourTime(std::shared_ptr<Class> p_class)
{
    std::vector<Time> vTimes;
    std::vector<std::shared_ptr<Teacher>> vTeachers;
    std::vector<std::shared_ptr<Location>> vLocations;
    for (int nDay = 0; nDay < DAY_COUNT; nDay++)
    {
        for (int nHour = 0; nHour < HOUR_COUNT; nHour++)
        {
            Time time{ nDay, nHour };
            vTimes.push_back(time);
            vTeachers.push_back(p_class->GetTeacher(time));
            vLocations.push_back(p_class->GetCatalog().GetLocation(time));
        }
    }

    std::vector<std::tuple<Time, Time>> vSwaps;
    for (size_t i = 0; i < vTimes.size(); i++)
    {
        for (size_t j = 0; j < vTimes.size(); j++)
        {
            if ((!vTeachers[i] && !vTeachers[j])
                || (vTeachers[i] && !vTeachers[i]->GetCatalog().IsFreeDay(vTimes[j]))
                || (vTeachers[j] && !vTeachers[j]->GetCatalog().IsFreeDay(vTimes[i]))
                || (vLocations[i] && !vLocations[i]->GetCatalog().IsFreeDay(vTimes[j]))
                || (vLocations[j] && !vLocations[j]->GetCatalog().IsFreeDay(vTimes[i])))
                continue;

            vSwaps.emplace_back(vTimes[i], vTimes[j]);
        }
    }

    if (vSwaps.empty())
        return std::nullopt;

    return vSwaps[Random::GetInt(0, int(vSwaps.size() - 1))];
}

std::string TimetableGenerator::WriteCatalog()
{
    json res = m_DB.WriteCatalog();

    res["active"] = m_bActive;
    res["fitnesClas"] = m_fitnessClass;
    res["fitnesTeacher"] = m_fitnessTeacher;
    res["fitnesLocation"] = m_fitnessLocation;
    res["elapsedTime"] = m_elapsedTime;

    std::string output = res.dump();

    return output;
}