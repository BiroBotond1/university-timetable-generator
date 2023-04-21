#include "ClassCatalog.h"
#include "Global.h"

ClassCatalog::ClassCatalog() : m_nCourseNumber(0) {}

double ClassCatalog::GetFitnessValue() {
	double dFitnessValue = 0;
	std::vector<int> vCourseNumbers(m_catalog.size(), 0);
	g_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		std::unordered_map<std::string, int> mCourseNumberOnADay;
		int hasEmptyHoursBetweenCourses = 0;
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				hasEmptyHours = true;
				continue;
			}

			if (mCourseNumberOnADay.find(m_catalog[nDay][nHour]) != mCourseNumberOnADay.end())
				mCourseNumberOnADay[m_catalog[nDay][nHour]]++;
			else
				mCourseNumberOnADay[m_catalog[nDay][nHour]] = 0;

			vCourseNumbers[nDay]++;

			if (hasEmptyHours) {
				hasEmptyHoursBetweenCourses++;
				hasEmptyHours = false;
				g_bActive = false;
			}

			//the courses starts at 8
			dFitnessValue += std::abs(nDay - 8);
		}
		//no empty hours between courses
		dFitnessValue -= hasEmptyHoursBetweenCourses * 10;

		//just 1 type of course on each day
		for (auto &courseNumber: mCourseNumberOnADay) {
			if (courseNumber.second > 1) {
				dFitnessValue -= courseNumber.second * 2;
				g_bActive = false;
			}
			courseNumber.second = 0;
		}
	}

	//even hours
	for (int i = 0; i < vCourseNumbers.size(); i++) {
		for (int j = 0; j < vCourseNumbers.size(); j++) {
			dFitnessValue -= pow(abs(vCourseNumbers[i] - vCourseNumbers[j]), 2);
		}
	}

	if (g_bActive) {
		dFitnessValue += 1000;
	}

	return dFitnessValue;
}