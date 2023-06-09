#include "LocationCatalog.h"
#include "global.h"

LocationCatalog::LocationCatalog() {}

LocationCatalog::LocationCatalog(const std::string p_strLocationID) : m_strLocationID(p_strLocationID) {}

LocationCatalog::LocationCatalog(const Catalog& rhsLocationCatalog, const std::string p_strLocationID)
	: Catalog(rhsLocationCatalog), m_strLocationID(p_strLocationID) {}

std::tuple<double, bool> LocationCatalog::Evaluate() {
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	m_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				continue;
			}

			m_dFitness += GetInactiveDaysFitness(nDay, nHour, g_locations[m_strLocationID].GetReservedDates());
		}
	}

	//ensure if the catalog is correct don t change that
	if (m_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
}
