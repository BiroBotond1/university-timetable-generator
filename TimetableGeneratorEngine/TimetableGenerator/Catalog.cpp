#include "Catalog.h"
#include "Global.h"


Catalog::Catalog() {
	m_catalog = std::vector<std::vector<std::vector<std::vector<int>>>>(
			2, std::vector<std::vector<std::vector<int>>>(5, std::vector<std::vector<int>>(12, std::vector<int>())));
}

bool Catalog::IsFreeDay(CoursePeriod eCoursePeriod, int day, int hour, int week, int p_nGroupID) {
	if (eCoursePeriod == CoursePeriod::weekly)
	{
		return HasInvalidGroup(p_nGroupID, m_catalog[0][day][hour]) && HasInvalidGroup(p_nGroupID, m_catalog[1][day][hour]);
	}
	return HasInvalidGroup(p_nGroupID, m_catalog[week][hour][day]);
}

bool Catalog::HasInvalidGroup(int p_nGroupID, std::vector<int> subCourseIDs) {
	bool hasInvalidGroup = true;
	for (auto subCourseID : subCourseIDs) {
		hasInvalidGroup = hasInvalidGroup && g_groupes[g_subCourses[subCourseID].GetGroupID()].IsValidityWithGroup(p_nGroupID);
	}
	return hasInvalidGroup;
}

void Catalog::Add(CoursePeriod eCoursePeriod, int day, int hour, int week, int subCourseID) {
	if (eCoursePeriod == CoursePeriod::weekly) {
		m_catalog[0][day][hour].push_back(subCourseID);
		m_catalog[1][day][hour].push_back(subCourseID);
		return;
	}
	m_catalog[week][day][hour].push_back(subCourseID);
}

void Catalog::Write() {
	for (int week = 0; week < m_catalog.size(); week++) {
		std::cout << week << ".het:" << std::endl;
		for (int day = 0; day < m_catalog[week].size(); day++) {
			std::cout << "	" << day << ".nap: " << std::endl;
			for (int hour = 0; hour < m_catalog[week][day].size(); hour++) {
				std::cout << "		" << hour << ".ora: ";
				for (auto subCourseID : m_catalog[week][day][hour]) {
					std::cout << "[" << g_subCourses[subCourseID].ToString() << "] ";
				}
				std::cout<< std::endl;
			}
		}
	}
}