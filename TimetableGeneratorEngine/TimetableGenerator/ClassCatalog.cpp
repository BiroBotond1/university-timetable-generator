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

			if (hasEmptyHours) {
				hasEmptyHoursBetweenCourses++;
				hasEmptyHours = false;
				g_bActive = false;
			}

			std::string nClassHourID = m_catalog[nDay][nHour].GetID();
			if (mCourseNumberOnADay.find(nClassHourID) != mCourseNumberOnADay.end())
				mCourseNumberOnADay[nClassHourID]++;
			else
				mCourseNumberOnADay[nClassHourID] = 0;

			vCourseNumbers[nDay]++;

			//the courses starts at 8
			dFitnessValue += std::abs(nDay - 8);
		}
		//no empty hours between courses
		dFitnessValue -= hasEmptyHoursBetweenCourses * 10;

		//just 1 type of course on each day
		for (auto courseNumber: mCourseNumberOnADay) {
			if (courseNumber.second > 1) {
				dFitnessValue -= courseNumber.second * 2;
				g_bActive = false;
			}
			courseNumber.second = 0;
		}
	}

	//even hours
	for (auto courseNumber1 : vCourseNumbers) {
		for (auto courseNumber2 : vCourseNumbers) {
			dFitnessValue -= pow(abs(courseNumber1 - courseNumber2), 2);
		}
	}

	if (g_bActive) {
		dFitnessValue += 1000;
	}

	return dFitnessValue;
}