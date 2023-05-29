#include "Location.h"
#include "Global.h"

Location::Location(const nlohmann::json &jsonLocation) {
	m_strID = jsonLocation["_id"].get<std::string>();
	m_catalog = std::make_unique<LocationCatalog>(m_strID);
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
	m_catalog->DeleteClassHour(p_nDay, p_nHour);
}

Location::Location(const Location& rhsLocation) {
	m_strID = rhsLocation.m_strID;
	m_strName = rhsLocation.m_strName;
	m_vReservedDates = rhsLocation.m_vReservedDates;
	m_catalog = std::make_unique<LocationCatalog>(*rhsLocation.m_catalog, m_strID);
}

void Location::operator=(const Location& rhsLocation) {
	m_strID = rhsLocation.m_strID;
	m_strName = rhsLocation.m_strName;
	m_vReservedDates = rhsLocation.m_vReservedDates;
	m_catalog = std::make_unique<LocationCatalog>(*rhsLocation.m_catalog, m_strID);
}