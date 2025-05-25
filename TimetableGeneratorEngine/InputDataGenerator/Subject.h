#pragma once
#include "Entity.h"
#include "Location.h"
#include "Config.h"

class Subject : public Entity
{
public:
    Subject() {}
    Subject(SubjectType p_type, const std::string& p_name) : Entity(), m_type(p_type), m_name(p_name) {}
    Subject(SubjectType p_type, const std::string& p_name, const std::vector<Location>& p_locations) : Entity(), m_type(p_type), m_name(p_name), m_locations(p_locations) {}

    json GetJson() const override;

    SubjectType GetType() const { return m_type; }
    std::string GetName() const { return m_name; }
    std::vector<Location> GetLocations() { return m_locations; }
    void SetLocations(const std::vector<Location>& p_locations) { m_locations = p_locations; }

private:
    SubjectType m_type;
    std::string m_name;
    std::vector<Location> m_locations;
};