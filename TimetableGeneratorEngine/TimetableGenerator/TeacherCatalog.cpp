#include "TeacherCatalog.h"
#include "Global.h"

TeacherCatalog::TeacherCatalog() {};

TeacherCatalog::TeacherCatalog(std::string p_strTeacherID) : m_strTeacherID(p_strTeacherID) {}

double TeacherCatalog::GetFitnessValue() {
	double dFitness = 0;
	g_bActive = true;
	std::vector<int> coursesNumbers(m_catalog.size(), 0);

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				hasEmptyHours = true;
				continue;
			}

			coursesNumbers[nDay]++;
			
			dFitness += GetInactiveDaysFitness(nDay, nHour, g_teachers[m_strTeacherID].GetInappropriateDates());

			if (g_bTeacherCatalogNoHoleHour)
				dFitness += GetNoHoleHoursFitness(hasEmptyHours);
		}
	}
	
	if (g_bTeacherCatalogEvenHours)
		dFitness += GetEvenDaysFitness(coursesNumbers);

	if (g_bActive) {
		dFitness += 1000;
	}

	return dFitness;
}