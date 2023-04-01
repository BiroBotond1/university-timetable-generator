#include "TeacherCatalog.h"
#include "Global.h"

TeacherCatalog::TeacherCatalog() {};

TeacherCatalog::TeacherCatalog(int p_nTeacherID) : m_nTeacherID(p_nTeacherID) {}

double TeacherCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	auto ineligibleDays = g_teachers[m_nTeacherID].GetIneligibleDays();
	std::vector<int> coursesNumbers(m_catalog.size(), 0);
	g_bActive = true;

	for (int day = 0; day < m_catalog.size(); day++) {
		int hasEmptyHoursBetweenCourses = 0;
		bool hasEmptyHours = false;

		for (int hour = 0; hour < m_catalog[day].size(); hour++) {
			if (m_catalog[day][hour] == -1) {
				hasEmptyHours = true;
				continue;
			}
			coursesNumbers[day]++;

			//a teacher can't work on ineligible date
			auto date = std::make_pair(day, hour);
			if (std::find(ineligibleDays.begin(), ineligibleDays.end(), date) != ineligibleDays.end()) {
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
