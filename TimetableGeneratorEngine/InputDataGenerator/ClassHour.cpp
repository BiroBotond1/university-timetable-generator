#include "stdafx.h"
#include "ClassHour.h"

json ClassHour::GetJson()
{
    json res;
    res["_id"] = m_id;
    res["number"] = m_number;
    res["class"] = m_classs.GetJson();
    res["subject"] = m_subject.GetJson();
    res["teacher"] = m_teacher.GetJson();
    res["weight"] = m_weight;
    return res;
}

void ClassHour::ChangeSubjectLocations(const std::vector<Location>& p_locations)
{
    m_subject.SetLocations(p_locations);
}