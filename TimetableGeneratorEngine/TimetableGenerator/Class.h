#pragma once
#include "Catalog.h"
#include "EntityWithCatalog.h"

class Class : public EntityWithCatalog
{
public:
	Class() {}
	Class(const nlohmann::json& jsonClass);
	//Class(const Class& rhsClass);
	//void operator=(const Class& rhsClass);
	const std::string	GetClassHourID(Time p_time);
	const std::string	GetTeacherID(Time p_time);
	const std::string	GetLocationID(Time p_time);
};

