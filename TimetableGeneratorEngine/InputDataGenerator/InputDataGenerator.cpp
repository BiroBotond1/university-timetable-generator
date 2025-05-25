#include "stdafx.h"
#include "InputDataGenerator.h"
#include "Random.h"

void InputDataGenerator::Run() 
{
    std::vector<Class> classes;
    std::vector<Location> locations;
    std::vector<Teacher> teachers;
    std::vector<ClassHour> classHours;

    std::unordered_map<SubjectType, SubjectLocationData> subjectLocationDataMap;
    std::unordered_map<SubjectType, SubjectTeacherData> subjectTeacherDataMap;

    auto subjects = InitializeSubjects();

    for (int i = 0; i < CLASS_NUMBER; i++)
    {
        CreateClass(classes, i);

        int classHourNumber = 0;
        int classHourTotal = CLASSHOUR_NUMBER_PER_WEEK + Random::GetInt(0, 4) - 2;
        std::unordered_set<SubjectType> usedSubjects;

        while (classHourNumber < classHourTotal)
        {
            int subjectClassHourNumber = classHourTotal - classHourNumber < 4 ? classHourTotal - classHourNumber : Random::GetInt(1, 4);

            //Get unused subject
            Subject subject = GetUnusedSubject(usedSubjects, subjects);
            usedSubjects.insert(subject.GetType());

            //Location
            AddLocationsFromSubject(subject, locations, subjectLocationDataMap[subject.GetType()], subjectClassHourNumber);

            //Teacher
            AddTeachersFromSubject(subject, teachers, subjectTeacherDataMap[subject.GetType()], subjectClassHourNumber);

            //Get the actual teacher
            auto teacher = subjectTeacherDataMap[subject.GetType()].Teachers.back();

            classHours.emplace_back(subjectClassHourNumber, classes[classes.size() - 1], teacher, subject, 1.0f);

            classHourNumber += subjectClassHourNumber;
        }
    }

    //Fill the subjects locations
    for (auto& subject : subjects)
    {
        subject.SetLocations(subjectLocationDataMap[subject.GetType()].Locations);
    }

    //Change fake subjects in the classHours
    for (auto& classHour : classHours) 
    {
        classHour.ChangeSubjectLocations(subjectLocationDataMap[classHour.GetSubject().GetType()].Locations);
    }

    WriteCatalog(classes, subjects, locations, teachers, classHours);
}

std::vector<Subject> InputDataGenerator::InitializeSubjects()
{
    std::vector<Subject> subjects;

    for (const auto& subjectType : g_subjectTypes)
    {
        subjects.emplace_back(subjectType, GetSubjectName(subjectType));
    }

    return subjects;
}

void InputDataGenerator::CreateClass(std::vector<Class>& classes, int i)
{
    std::string className = std::to_string(i + 1) + ". osztaly";
    std::string classLocation = std::to_string(i + CLASSROOM_START_INDEX) + "A";
    classes.emplace_back(className, classLocation);
}

void InputDataGenerator::AddLocationsFromSubject(const Subject& p_subject, std::vector<Location>& p_locations, SubjectLocationData& p_subjectLocationData, int p_subjectClassHourNumber)
{
    auto subjectType = p_subject.GetType();
    auto subjectName = p_subject.GetName();

    if (!IsSubjectContainsLocation(subjectType))
        return;

    //First location, we have to add 1 Location to Locations
    if (!p_subjectLocationData.IsUsed)
    {
        p_locations.emplace_back(subjectName + " terem");
        p_subjectLocationData.IsUsed = true;
        p_subjectLocationData.Locations.push_back(p_locations.back());
    }

    //The previous Location is full we have to add a new
    if (p_subjectLocationData.ClassHoursCount + p_subjectClassHourNumber > LOCATION_CLASSHOUR_NUMBER_PER_WEEK)
    {
        p_subjectLocationData.ClassHoursCount = 0;
        p_subjectLocationData.LocationCount++;
        p_locations.emplace_back(subjectName + " terem " + std::to_string(p_subjectLocationData.LocationCount));
        p_subjectLocationData.Locations.push_back(p_locations.back());
    }

    p_subjectLocationData.ClassHoursCount += p_subjectClassHourNumber;
}

void InputDataGenerator::AddTeachersFromSubject(const Subject& p_subject, std::vector<Teacher>& p_teachers, SubjectTeacherData& p_subjectTeacherData, int p_subjectClassHourNumber)
{
    auto subjectType = p_subject.GetType();
    auto subjectName = p_subject.GetName();

    //First teacher, we have to add 1 Teacher to Teachers
    if (!p_subjectTeacherData.IsUsed)
    {
        p_teachers.emplace_back(subjectName + " tanar");
        p_subjectTeacherData.IsUsed = true;
        p_subjectTeacherData.Teachers.push_back(p_teachers.back());
    }

    //The previous Teacher is full we have to add a new
    if (p_subjectTeacherData.ClassHoursCount + p_subjectClassHourNumber > TEACHER_CLASSHOUR_NUMBER_PER_WEEK)
    {
        p_subjectTeacherData.ClassHoursCount = 0;
        p_subjectTeacherData.TeacherCount++;
        p_teachers.emplace_back(subjectName + " tanar" + std::to_string(p_subjectTeacherData.TeacherCount));
        p_subjectTeacherData.Teachers.push_back(p_teachers.back());
    }

    p_subjectTeacherData.ClassHoursCount += p_subjectClassHourNumber;
}

void InputDataGenerator::SetInitialSubjectLocationNumbers(std::unordered_map<SubjectType, SubjectTeacherData>& p_subjectTeacherDataMap)
{
    for (auto& subjectType : g_subjectTypes)
    {
        if (IsSubjectContainsLocation(subjectType))
        {
            p_subjectTeacherDataMap[subjectType].TeacherCount = 1;
        }
    }
}

Subject InputDataGenerator::GetUnusedSubject(const std::unordered_set<SubjectType>& usedSubjects, const std::vector<Subject>& p_subjects)
{
    auto subjectType = g_subjectTypes[Random::GetInt(0, g_subjectTypes.size() - 1)];
    while (usedSubjects.count(subjectType)) {
        subjectType = g_subjectTypes[Random::GetInt(0, g_subjectTypes.size() - 1)];
    }

    Subject foundSubject;
    for (auto subject : p_subjects) {
        if (subject.GetType() == subjectType)
        {
            foundSubject = subject;
        }
    }

    return foundSubject;
}

void InputDataGenerator::WriteCatalog(const std::vector<Class>& p_classes, const std::vector<Subject>& p_subjects, const std::vector<Location>& p_locations, const std::vector<Teacher>& p_teachers, const std::vector<ClassHour>& p_classHours)
{
    json res;
    res["OneTypeOfCourseOnADayClass"] = true;
    res["ClassCoursesStartsAtEight"] = true;
    res["NoHoleHoursInClass"] = true;
    res["EvenHoursInClass"] = true;
    res["NoHoleHoursInTeacher"] = true;
    res["EvenHoursInTeacher"] = true;
    res["CoursesWeightInClass"] = true;

    res["classes"] = GetEntitiesAsJson(p_classes);
    res["subjects"] = GetEntitiesAsJson(p_subjects);
    res["locations"] = GetEntitiesAsJson(p_locations);
    res["teachers"] = GetEntitiesAsJson(p_teachers);
    res["classHours"] = GetEntitiesAsJson(p_classHours);

    std::ofstream file("generated_input.json");
    file << res;
    file.close();
}

template<typename T>
std::vector<json> InputDataGenerator::GetEntitiesAsJson(const std::vector<T>& entities)
{
    std::vector<json> jsonEntities;
    jsonEntities.reserve(entities.size());

    for (const auto& entity : entities)
    {
        jsonEntities.push_back(entity.GetJson());
    }
    return jsonEntities;
}