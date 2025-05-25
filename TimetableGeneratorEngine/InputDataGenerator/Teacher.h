#pragma once
#include "Entity.h"

class Teacher : public Entity
{
public:
  
    Teacher(const std::string& p_name) : Entity(), m_name(p_name), m_inappropriateDates(DAYS, std::vector<int>(HOURS, 0)) {}

    json GetJson() const override;

    std::string GetName() const { return m_name; }

private:
    std::string m_name;
    std::vector<std::vector<int>> m_inappropriateDates;
};