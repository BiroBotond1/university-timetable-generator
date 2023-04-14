#include "Catalog.h"
#include "Global.h"


Catalog::Catalog() {
	m_catalog = std::vector<std::vector<std::string>>(DAY_COUNT, std::vector<std::string>(HOUR_COUNT, ""));
}

bool Catalog::IsFreeDay(int p_nDay, int p_nHour) {
	return m_catalog[p_nDay][p_nHour].compare("") == 0;
}

void Catalog::Add(int p_nDay, int p_nHour, std::string p_strSubCourseID) {
	m_catalog[p_nDay][p_nHour] = p_strSubCourseID;
}

void Catalog::Write() {
	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		std::cout << nDay <<".nap: " << std::endl;
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				std::cout << "	" << nHour + 8 << "-" << nHour + 9 << ":" << "---------" << std::endl;
			}
			else {
				std::cout << "	" << nHour + 8 << "-" << nHour + 9 << ":" << g_classHours[m_catalog[nDay][nHour]].ToString() << std::endl;
			}
		}
	}
}

std::string Catalog::GetClassHourID(int p_nDay, int p_nHour) {
	return m_catalog[p_nDay][p_nHour];
}

void Catalog::Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) {
	std::string strClassHourID = m_catalog[p_nDay1][p_nHour1];
	m_catalog[p_nDay1][p_nHour1] = m_catalog[p_nDay2][p_nHour2];
	m_catalog[p_nDay2][p_nHour2] = strClassHourID;
}

void Catalog::SetClassHourID(int p_nDay, int p_nHour, std::string p_strClassHourID) {
	m_catalog[p_nDay][p_nHour] = p_strClassHourID;
}

nlohmann::json Catalog::GetJSONObj() {
	return nlohmann::json(m_catalog);
}