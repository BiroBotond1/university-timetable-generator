#include "Teacher.h"

void Teacher::AddIneligibleDay(DateTime dateTime) {
	m_ineligibleDays.push_back(dateTime);
}

Teacher::Teacher() {};

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_strName = jsonTeacher["name"].get<std::string>();
	for (auto ineligibleDays : jsonTeacher["ineligibleDays"])
	{
		AddIneligibleDay(DateTime{ ineligibleDays });
	}
}

std::string Teacher::GetName() {
	return m_strName;
}

Catalog Teacher::GetCatalog() {
	return m_catalog;
}