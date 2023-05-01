#include "TeacherCatalog.h"
#include "Global.h"

TeacherCatalog::TeacherCatalog() {};

TeacherCatalog::TeacherCatalog(std::string p_strTeacherID) : m_strTeacherID(p_strTeacherID) {}

TeacherCatalog::TeacherCatalog(const Catalog& rhsTeacherCatalog, std::string p_strTeacherID)
	: Catalog(rhsTeacherCatalog), m_strTeacherID(p_strTeacherID) {}

double TeacherCatalog::GetFitnessValue() {
	if (!m_bChanged)
		return m_dFitness;

	m_dFitness = 0;
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
			
			m_dFitness += GetInactiveDaysFitness(nDay, nHour, g_teachers[m_strTeacherID].GetInappropriateDates());

			if (g_bTeacherCatalogNoHoleHour)
				m_dFitness += GetNoHoleHoursFitness(hasEmptyHours);
		}
	}
	
	if (g_bTeacherCatalogEvenHours)
		m_dFitness += GetEvenDaysFitness(coursesNumbers);

	if (g_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return m_dFitness;
}