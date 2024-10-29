#pragma once
#include "EntityWithCatalog.h"

class Location : public EntityWithCatalog
{
public:
	Location(const nlohmann::json& jsonLocation, const TimetableConfig& p_config);
	Location(const Location& p_location) : m_vReservedDates(p_location.m_vReservedDates), EntityWithCatalog(p_location.m_id, p_location.m_name, p_location.m_catalog) {}

	std::shared_ptr<Location> Clone() const;

	std::vector<std::pair<int, int>>& GetReservedDates();
	void							DeleteClassHour(Time p_time);

private:
	std::vector<std::pair<int, int>>	m_vReservedDates;
};