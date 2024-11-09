#include "stdafx.h"
#include "Database.h"
#include "TimetableConfig.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"
#include "ClassHour.h"
#include "Random.h"

void Database::Fill(const std::string& p_fileName)
{
    std::ifstream fin(p_fileName);
    json data = json::parse(fin);
    TimetableConfig	config;
    config.ReadFromJson(data);

    for (auto& jsonTeacher : data["teachers"])
    {
        m_teachers.emplace(jsonTeacher["_id"], std::make_shared<Teacher>(jsonTeacher, config));
    }

    for (auto& jsonLocation : data["locations"])
    {
        m_locations.emplace(jsonLocation["_id"], std::make_shared<Location>(jsonLocation, config));
    }

    for (auto& jsonClass : data["classes"])
    {
        m_classes.emplace(jsonClass["_id"], std::make_shared<Class>(jsonClass, config));
        m_classIDs.push_back(jsonClass["_id"]);
    }

    for (auto& jsonSubject : data["subjects"])
    {
        m_subjects.emplace(jsonSubject["_id"], std::make_shared<Subject>(jsonSubject, m_locations));
    }

    for (auto& jsonClassHour : data["classHours"])
    {
        auto teacherId = jsonClassHour["teacher"]["_id"].get<std::string>();
        auto classId = jsonClassHour["class"]["_id"].get<std::string>();
        auto subjectId = jsonClassHour["subject"]["_id"].get<std::string>();
        m_classHours.emplace(jsonClassHour["_id"], std::make_shared<ClassHour>(jsonClassHour, m_teachers[teacherId], m_classes[classId], m_subjects[subjectId]));
    }
}

std::shared_ptr<Class> Database::GetRandomClass()
{
    std::string classId = m_classIDs[Random::GetInt(0, int(m_classIDs.size() - 1))];
    return m_classes[classId];
}

json Database::WriteCatalog()
{
    json res, classCatalogs, teacherCatalogs, locationsCatalogs;
    for (auto& clas : m_classes)
    {
        classCatalogs[clas.first] = clas.second->GetCatalog().GetJSONObj();
    }
    for (auto& teacher : m_teachers)
    {
        teacherCatalogs[teacher.first] = teacher.second->GetCatalog().GetJSONObj();
    }
    for (auto& location : m_locations)
    {
        locationsCatalogs[location.first] = location.second->GetCatalog().GetJSONObj();
    }
    res["classCatalogs"] = classCatalogs;
    res["teacherCatalogs"] = teacherCatalogs;
    res["locationCatalogs"] = locationsCatalogs;

    return res;
}

void Database::DeepCopy(Database& p_copyDB)
{
    p_copyDB.m_classIDs = m_classIDs;
    p_copyDB.m_teachers = DeepCopyMap<Teacher>(m_teachers);
    p_copyDB.m_locations = DeepCopyMap<Location>(m_locations);
    p_copyDB.m_classes = DeepCopyMap<Class>(m_classes);
    p_copyDB.m_subjects = DeepCopySubjects(p_copyDB);
    p_copyDB.m_classHours = DeepCopyClassHours(p_copyDB);
   
    ChangeCatalogPointers(p_copyDB);
}

template <typename T>
std::unordered_map<std::string, std::shared_ptr<T>> Database::DeepCopyMap(const std::unordered_map<std::string, std::shared_ptr<T>>& p_originalMap)
{
    std::unordered_map<std::string, std::shared_ptr<T>> copyMap;
    copyMap.reserve(p_originalMap.size());
    for (const auto& [key, entity] : p_originalMap)
    {
        copyMap[key] = entity ? entity->Clone() : nullptr;
    }
    return copyMap;
}

SubjectMap Database::DeepCopySubjects(const Database& p_copyDB)
{
    SubjectMap copiedSubjects;
    copiedSubjects.reserve(m_subjects.size());

    for (const auto& [key, subject] : m_subjects)
    {
        copiedSubjects.emplace(key, subject ? subject->Clone(p_copyDB.m_locations) : nullptr);
    }

    return copiedSubjects;
}

ClassHourMap Database::DeepCopyClassHours(const Database& p_copyDB)
{
    ClassHourMap copiedClassHours;
    copiedClassHours.reserve(m_classHours.size());

    for (const auto& [key, classHour] : m_classHours)
    {
        copiedClassHours.emplace(key, classHour ? classHour->Clone(p_copyDB.m_teachers, p_copyDB.m_classes, p_copyDB.m_subjects) : nullptr);
    }

    return copiedClassHours;
}

void Database::ChangeCatalogPointers(const Database& p_copyDB)
{
    for (auto& [key, teacher] : p_copyDB.m_teachers)
    {
        teacher->GetCatalog().ChangePointers(p_copyDB.m_classHours, p_copyDB.m_locations);
    }

    for (auto& [key, location] : p_copyDB.m_locations)
    {
        location->GetCatalog().ChangePointers(p_copyDB.m_classHours, p_copyDB.m_locations);
    }

    for (auto& [key, clas] : p_copyDB.m_classes)
    {
        clas->GetCatalog().ChangePointers(p_copyDB.m_classHours, p_copyDB.m_locations);
    }
}