#include "LocationCatalog.h"
#include "global.h"

LocationCatalog::LocationCatalog() {}

LocationCatalog::LocationCatalog(int p_nID) : m_nLocationID(p_nID) {}

double LocationCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	auto reservedDates = g_locations[m_nLocationID].GetReservedDates();
	g_bActive = true;

	for (int day = 0; day < m_catalog.size(); day++) {
		for (int hour = 0; hour < m_catalog[day].size(); hour++) {
			if (m_catalog[day][hour] == -1) {
				continue;
			}

			//a classhour can't be on a reserved date
			auto date = std::make_pair(day, hour);
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