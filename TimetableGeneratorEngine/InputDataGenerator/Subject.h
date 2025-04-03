#pragma once
#include "Entity.h"
#include "Location.h"

class Subject : public Entity
{
public:

    Subject(const std::string& p_name) : Entity(), m_name(p_name) {}
    Subject(const std::string& p_name, const std::vector<Location>& p_locations) :Entity(), m_name(p_name), m_locations(p_locations) {}

    json GetJson();

    std::string GetName() { return m_name; }
    std::vector<Location> GetLocations() { return m_locations; }
    void SetLocations(const std::vector<Location>& p_locations) { m_locations = p_locations; }

private:
    std::string m_name;
    std::vector<Location> m_locations;
};