#pragma once

#include "stdafx.h"
#include "Catalog.h"
#include "EntityWithCatalog.h"

class Location :public EntityWithCatalog
{
	std::vector<std::pair<int, int>>	m_vReservedDates;
public:
	Location() {}
	Location(const nlohmann::json& jsonLocation);
	//Location(const Location& rhsLocation);
	const std::vector<std::pair<int, int>>&	GetReservedDates();
	void DeleteClassHour(const int p_nDay,const int p_nHour);
	//void operator=(const Location& rhsLocation);
};