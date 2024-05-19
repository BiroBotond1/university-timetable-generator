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
	const std::vector<std::pair<int, int>>&	GetReservedDates();
	void DeleteClassHour(Time p_time);
};