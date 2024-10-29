#pragma once
#include "EntityWithCatalog.h"

class Location;
class Teacher;

class Class : public EntityWithCatalog
{
public:
	Class(const nlohmann::json& jsonClass, const TimetableConfig& p_config);
	Class(const Class& p_class) : EntityWithCatalog(p_class.m_id, p_class.m_name, p_class.m_catalog) {}

	std::shared_ptr<Class> Clone() const;

	std::shared_ptr<Teacher>	GetTeacher(Time p_time);
};

