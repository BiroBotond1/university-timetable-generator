#pragma once
#include "Entity.h"

class EntityWithName : public Entity
{
public:
	EntityWithName(const nlohmann::json& p_json) : Entity(p_json), m_name(p_json["name"].get<std::string>()) {};
	EntityWithName(const std::string& p_id, const std::string& p_name) : m_name(p_name), Entity(p_id) {};

protected:
	std::string m_name;
};

