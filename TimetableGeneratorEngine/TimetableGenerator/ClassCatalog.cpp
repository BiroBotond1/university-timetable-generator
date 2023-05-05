#include "ClassCatalog.h"
#include "Global.h"

ClassCatalog::ClassCatalog() {}

ClassCatalog::ClassCatalog(const Catalog& rhsClassCatalog) : Catalog(rhsClassCatalog) {}

void ClassCatalog::AddCourseNumberOnADay(std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay) {
	if (p_mCourseNumberOnADay.find(strClassHourID) != p_mCourseNumberOnADay.end())
		p_mCourseNumberOnADay[strClassHourID]++;
	else
		p_mCourseNumberOnADay[strClassHourID] = 0;
}

//just 1 type of course on each day
double ClassCatalog::GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay) {
	double dFitness = 0;
	for (auto& courseNumber : p_mCourseNumberOnADay) {
		if (courseNumber.second > 1) {
			dFitness -= courseNumber.second * 2;
			g_bActive = false;
		}
		courseNumber.second = 0;
	}
	return dFitness;
}

double ClassCatalog::GetFitnessValue() {
	if (!m_bChanged)
		return m_dFitness;

	m_dFitness = 0;
	std::vector<int> vCourseNumbers(m_catalog.size(), 0);
	g_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		std::unordered_map<std::string, int> mCourseNumberOnADay;
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				hasEmptyHours = true;
				continue;
			}
			
			vCourseNumbers[nDay]++;

			if(g_bClassCatalogOneTypeOfCourseOnADay)
				AddCourseNumberOnADay(m_catalog[nDay][nHour], mCourseNumberOnADay);

			if (g_bClassCatalogNoHoleHour)
				m_dFitness += GetNoHoleHoursFitness(hasEmptyHours);

			//the courses starts at 8
			if (g_bClassCatalogCoursesStartsAtEight) {
				if(g_bClassCatalogCoursesWeight) 
					m_dFitness += std::abs(nDay - 8) * g_classHours[m_catalog[nDay][nHour]].GetWeight();
				else 
					m_dFitness += std::abs(nDay - 8);
			}
		}

		if(g_bClassCatalogOneTypeOfCourseOnADay)
			GetFitnessOneTypeOfCourseOnADay(mCourseNumberOnADay);
	}

	if (g_bClassCatalogEvenHours)
		m_dFitness += GetEvenDaysFitness(vCourseNumbers);

	if (g_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return m_dFitness;
}