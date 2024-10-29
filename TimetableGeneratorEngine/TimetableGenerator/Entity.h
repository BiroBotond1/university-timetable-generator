#pragma once

class Entity
{
public:
	Entity(const nlohmann::json& p_json) : m_id(p_json["_id"].get<std::string>()) {}
	Entity(const std::string& p_id) : m_id(p_id) {}

	std::string GetId() const { return m_id; }

protected:
	std::string m_id;
};

