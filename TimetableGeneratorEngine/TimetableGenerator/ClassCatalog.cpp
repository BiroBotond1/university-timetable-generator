#include "ClassCatalog.h"
#include "Global.h"

ClassCatalog::ClassCatalog() : m_nCourseNumber(0) {}

double ClassCatalog::GetFitnessValue() {
	double fitnessValue = 0;
	std::vector<int> courseNumberOnADay(m_nCourseNumber, 0);
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

			courseNumberOnADay[m_catalog[day][hour]]++;
			coursesNumbers[day]++;

			if (hasEmptyHours) {
				hasEmptyHoursBetweenCourses++;
				hasEmptyHours = false;
				g_bActive = false;
			}

			//the courses starts at 8
			fitnessValue += std::abs(day - 8);
		}
		//no empty hours between courses
		fitnessValue -= hasEmptyHoursBetweenCourses * 10;

		//just 1 type of course on each day
		for (int j = 0; j < m_nCourseNumber; j++) {
			if (courseNumberOnADay[j] > 1) {
				fitnessValue -= courseNumberOnADay[j] * 2;
				g_bActive = false;
			}
			courseNumberOnADay[j] = 0;
		}
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

void ClassCatalog::IncrementCourseNumber() {
	m_nCourseNumber++;
}