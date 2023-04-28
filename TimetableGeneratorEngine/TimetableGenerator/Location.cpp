#include "Location.h"
#include "Global.h"

Location::Location(const nlohmann::json &jsonLocation) {
	m_strID = jsonLocation["_id"].get<std::string>();
	m_catalog = std::make_shared<LocationCatalog>(LocationCatalog{ m_strID });
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

std::vector<std::pair<int, int>> Location::GetReservedDates() {
	return m_vReservedDates;
}

void Location::DeleteClassHour(int p_nDay, int p_nHour) {
	m_catalog->DeleteClassHour(p_nDay, p_nHour);
}