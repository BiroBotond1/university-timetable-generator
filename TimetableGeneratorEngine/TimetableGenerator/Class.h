#pragma once
#include "stdafx.h"
#include "ClassCatalog.h"
#include "EntityWithCatalog.h"

class Class : public EntityWithCatalog
{
public:
	Class() {}
	Class(const nlohmann::json& jsonClass);
	void operator=(const Class& rhsClass);
	const std::string	GetClassHourID(const int p_nDay, const int p_nHour);
	const std::string	GetTeacherID(const int p_nDay, const int p_nHour);
	const std::string	GetLocationID(const int p_nDay, const int p_nHour);
};

