#pragma once
#include "stdafx.h"
#include "ClassCatalog.h"
#include "EntityWithCatalog.h"

class Class : public EntityWithCatalog
{
public:
	Class() {}
	Class(const nlohmann::json& jsonClass);
	std::string			GetClassHourID(int p_nDay, int p_nHour);
	std::string			GetTeacherID(int p_nDay, int p_nHour);
	std::string			GetLocationID(int p_nDay, int p_nHour);
};

