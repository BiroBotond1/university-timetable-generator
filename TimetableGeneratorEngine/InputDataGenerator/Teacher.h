#pragma once
#include "Entity.h"

class Teacher : public Entity
{
public:
  
    Teacher(const std::string& p_name) : Entity(), m_name(p_name), m_inappropriateDates(DAYS, std::vector<int>(HOURS, 0)) {}

    json GetJson();

    std::string GetName() { return m_name; }

private:
    std::string m_name;
    std::vector<std::vector<int>> m_inappropriateDates;
};