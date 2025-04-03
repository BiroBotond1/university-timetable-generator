#pragma once
#include "Entity.h"
#include "Teacher.h"
#include "Class.h"
#include "Subject.h"

class ClassHour : public Entity
{
public:
   
    ClassHour(int p_number, const Class& p_classs, const Teacher& p_teacher, const Subject& p_subject, float p_weight)
        : Entity(), m_number(p_number), m_classs(p_classs), m_teacher(p_teacher), m_subject(p_subject), m_weight(p_weight) {}

    json GetJson();

    void ChangeSubjectLocations(const std::vector<Location>& p_locations);
    Subject GetSubject() { return m_subject; }

private:
    int m_number;
    Class m_classs;
    Teacher m_teacher;
    Subject m_subject;
    float m_weight;
};