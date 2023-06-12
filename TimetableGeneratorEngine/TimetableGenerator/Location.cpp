#include "Location.h"
#include "Global.h"

Location::Location(const nlohmann::json &jsonLocation) {
	m_strID = jsonLocation["_id"].get<std::string>();
	m_catalog = Catalog();
	m_strName = jsonLocation["name"].get<std::string>();
	int nDay = 0, nHour;
	for (auto hours : jsonLocation["reservedDates"])
	{
		nHour = 0;
		for (auto valid : hours)
		{
			if (valid == -1)
				m_vReservedDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}
		nDay++;
	}
}

const std::vector<std::pair<int, int>>& Location::GetReservedDates() {
	return m_vReservedDates;
}

void Location::DeleteClassHour(const int p_nDay, const int p_nHour) {
	m_catalog.DeleteClassHour(p_nDay, p_nHour);
}