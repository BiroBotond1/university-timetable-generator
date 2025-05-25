#pragma once
#include "Entity.h"

class Class : public Entity 
{
public:

    Class(const std::string& p_name, const std::string& p_location) : Entity(), m_name(p_name), m_location(p_location) {}

    json GetJson() const override;

    std::string GetName() const { return m_name; }

private:
    std::string m_name;
    std::string m_location;
};