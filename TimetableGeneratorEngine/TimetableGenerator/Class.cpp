#include "Class.h"
#include "global.h"

Class::Class(const nlohmann::json& jsonClass) {
	m_strID = jsonClass["_id"].get<std::string>();
	m_strName = jsonClass["name"].get<std::string>();
	m_catalog = std::make_shared<ClassCatalog>(ClassCatalog());
}

std::string Class::GetClassHourID(int p_nDay, int p_nHour) {
	return m_catalog->GetClassHourID(p_nDay, p_nHour);
}

std::string	Class::GetTeacherID(int p_nDay, int p_nHour) {
	if (m_catalog->IsFreeDay(p_nDay, p_nHour))
		return "";
	return g_classHours[m_catalog->GetClassHourID(p_nDay, p_nHour)].GetTeacherID();
}

std::string Class::GetLocationID(int p_nDay, int p_nHour) {
	if (m_catalog->IsFreeDay(p_nDay, p_nHour))
		return "";
	return m_catalog->GetLocationID(p_nDay, p_nHour);
}