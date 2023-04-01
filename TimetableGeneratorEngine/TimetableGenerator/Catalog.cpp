#include "Catalog.h"
#include "Global.h"


Catalog::Catalog() {
	m_catalog = std::vector<std::vector<int>>(5, std::vector<int>(8, -1));
}

bool Catalog::IsFreeDay(int day, int hour) {
	return m_catalog[day][hour] == -1;
}

void Catalog::Write() {
	for (int day = 0; day < m_catalog.size(); day++) {
		std::cout << day <<".nap: " << std::endl;
		for (int hour = 0; hour < m_catalog[day].size(); hour++) {
			if (m_catalog[day][hour] == -1) {
				std::cout << "	" << hour + 8 << "-" << hour + 9 << ":" << "---------" << std::endl;
			}
			else {
				std::cout << "	" << hour + 8 << "-" << hour + 9 << ":" << g_classHours[m_catalog[day][hour]].ToString() << std::endl;
			}
		}
	}
}

void Catalog::Add(int day, int hour, int subCourseID) {
	m_catalog[day][hour] = subCourseID;
}

void Catalog::Change(int day1, int hour1, int day2, int hour2) {
	int classHourID = m_catalog[day1][hour1];
	m_catalog[day1][hour1] = m_catalog[day2][hour2];
	m_catalog[day2][hour2] = classHourID;
}

int Catalog::GetClassHourID(int day, int hour) {
	return m_catalog[day][hour];
}

void Catalog::SetClassHourID(int day, int hour, int classHour) {
	m_catalog[day][hour] = classHour;
}