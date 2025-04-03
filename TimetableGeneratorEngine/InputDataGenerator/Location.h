#pragma once
#include "Entity.h"

class Location : public Entity
{
public:

    Location(const std::string& p_name) : Entity(), m_name(p_name), m_reservedDates(DAYS, std::vector<int>(HOURS, 0)) {}

    json GetJson();

    std::string GetName() { return m_name; }

private:
    std::string m_name;
    std::vector<std::vector<int>> m_reservedDates;
};