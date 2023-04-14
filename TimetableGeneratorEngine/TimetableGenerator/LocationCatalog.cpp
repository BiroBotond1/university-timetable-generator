#include "LocationCatalog.h"
#include "global.h"

LocationCatalog::LocationCatalog() {}

LocationCatalog::LocationCatalog(std::string p_strLocationID) : m_strLocationID(p_strLocationID) {}

double LocationCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	auto reservedDates = g_locations[m_strLocationID].GetReservedDates();
	g_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				continue;
			}

			//a classhour can't be on a reserved date
			auto date = std::make_pair(nDay, nHour);
			if (std::find(reservedDates.begin(), reservedDates.end(), date) != reservedDates.end()) {
				fitnessValue -= 10;
				g_bActive = false;
			}
		}
	}

	if (g_bActive) {
		fitnessValue += 1000;
	}

	return fitnessValue;
}
