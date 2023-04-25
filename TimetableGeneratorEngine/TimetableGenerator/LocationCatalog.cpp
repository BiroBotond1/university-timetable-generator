#include "LocationCatalog.h"
#include "global.h"

LocationCatalog::LocationCatalog() {}

LocationCatalog::LocationCatalog(std::string p_strLocationID) : m_strLocationID(p_strLocationID) {}

double LocationCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	g_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				continue;
			}

			fitnessValue += GetInactiveDaysFitness(nDay, nHour, g_locations[m_strLocationID].GetReservedDates());
		}
	}

	//ensure if the catalog is correct don t change that
	if (g_bActive) {
		fitnessValue += 1000;
	}

	return fitnessValue;
}
