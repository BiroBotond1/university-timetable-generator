#pragma once

#include "stdafx.h"
#include "LocationCatalog.h"
#include "EntityWithCatalog.h"

class Location :public EntityWithCatalog
{
	std::vector<std::pair<int, int>>	m_vReservedDates;
public:
	Location() {}
	Location(const nlohmann::json& jsonLocation);
	std::vector<std::pair<int, int>>	GetReservedDates();
	void								DeleteClassHour(int p_nDay, int p_nHour);
};