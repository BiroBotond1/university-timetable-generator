#include "stdafx.h"
#include "Location.h"

Location::Location(const nlohmann::json &jsonLocation, const TimetableConfig& p_config) : EntityWithCatalog(jsonLocation, p_config)
{
	int nDay = 0;
	for (auto hours : jsonLocation["reservedDates"])
	{
		int nHour = 0;
		for (auto valid : hours)
		{
			if (valid == -1)
				m_vReservedDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}
		nDay++;
	}
}

std::shared_ptr<Location> Location::Clone() const
{
	return std::make_shared<Location>(*this);
}

std::tuple<double, bool> Location::Evaluate()
{
	return m_catalog.EvaluateLocationCatalog(*this);
}

const std::vector<std::pair<int, int>>& Location::GetReservedDates() const
{
	return m_vReservedDates;
}

void Location::DeleteClassHour(Time p_time) 
{
	m_catalog.DeleteClassHour(p_time);
}