#include "TeacherCatalog.h"
#include "Global.h"

TeacherCatalog::TeacherCatalog() {};

TeacherCatalog::TeacherCatalog(std::string p_strTeacherID) : m_strTeacherID(p_strTeacherID) {}

double TeacherCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	auto inappropriateDates = g_teachers[m_strTeacherID].GetInappropriateDates();
	std::vector<int> coursesNumbers(m_catalog.size(), 0);
	g_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		int hasEmptyHoursBetweenCourses = 0;
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				hasEmptyHours = true;
				continue;
			}
			coursesNumbers[nDay]++;

			//a teacher can't work on ineligible date
			auto date = std::make_pair(nDay, nHour);
			if (std::find(inappropriateDates.begin(), inappropriateDates.end(), date) != inappropriateDates.end()) {
				fitnessValue -= 10;
				g_bActive = false;
			}

			if (hasEmptyHours) {
				hasEmptyHoursBetweenCourses++;
				hasEmptyHours = false;
				g_bActive = false;
			}
		}
		//no empty hours between courses
		fitnessValue -= hasEmptyHoursBetweenCourses * 4;
	}

	//even hours
	for (int i = 0; i < coursesNumbers.size(); i++) {
		for (int j = 0; j < coursesNumbers.size(); j++) {
			fitnessValue -= pow(abs(coursesNumbers[i] - coursesNumbers[j]), 2);
		}
	}

	if (g_bActive) {
		fitnessValue += 1000;
	}

	return fitnessValue;
}