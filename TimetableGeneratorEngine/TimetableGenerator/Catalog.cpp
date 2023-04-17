#include "Catalog.h"
#include "Global.h"

Catalog::Catalog() {
	m_catalog = std::vector<std::vector<ClassHour>>(DAY_COUNT, std::vector<ClassHour>(HOUR_COUNT, ClassHour()));
}

bool Catalog::IsFreeDay(int p_nDay, int p_nHour) {
	return m_catalog[p_nDay][p_nHour].IsEmpty();
}

void Catalog::Add(int p_nDay, int p_nHour, std::string p_strClassHourID) {
	m_catalog[p_nDay][p_nHour] = g_classHours[p_strClassHourID];
}

void Catalog::Write() {
	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		std::cout << nDay <<".nap: " << std::endl;
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(nDay, nHour)) {
				std::cout << "	" << nHour + 8 << "-" << nHour + 9 << ":" << "---------" << std::endl;
			}
			else {
				std::cout << "	" << nHour + 8 << "-" << nHour + 9 << ":" << m_catalog[nDay][nHour].ToString() << std::endl;
			}
		}
	}
}

std::string Catalog::GetClassHourID(int p_nDay, int p_nHour) {
	return m_catalog[p_nDay][p_nHour].GetID();
}

void Catalog::Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) {
	ClassHour classHour = m_catalog[p_nDay1][p_nHour1];
	m_catalog[p_nDay1][p_nHour1] = m_catalog[p_nDay2][p_nHour2];
	m_catalog[p_nDay2][p_nHour2] = classHour;
}

void Catalog::Delete(int p_nDay, int p_nHour) {
	m_catalog[p_nDay][p_nHour] = ClassHour();
}

nlohmann::json Catalog::GetJSONObj() {
	nlohmann::json json;
	//for (auto day : )
		return json;/*nlohmann::json(m_catalog);*/
}

void Catalog::SetClassHour(ClassHour p_classHour, int p_nDay, int p_nHour) {
	m_catalog[p_nDay][p_nHour] = p_classHour;
}