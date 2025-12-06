#pragma once
#include "EntityWithCatalog.h"

class Location;
class Teacher;

class Class : public EntityWithCatalog
{
public:
	Class(const nlohmann::json& jsonClass, const TimetableConfig& p_config);
	Class(const Class& p_class) : EntityWithCatalog(p_class.m_id, p_class.m_name, p_class.m_catalog), m_location(p_class.m_location) {}

	std::shared_ptr<Class> Clone() const;

	std::tuple<double, bool> Evaluate() override;

	std::shared_ptr<Teacher>	GetTeacher(Time p_time);

	std::string GetClassRoom() { return m_location; }
private:
	std::string m_location;
};

