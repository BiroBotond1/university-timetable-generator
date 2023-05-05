#include "Class.h"
#include "global.h"

Class::Class(const nlohmann::json& jsonClass) {
	m_strID = jsonClass["_id"].get<std::string>();
	m_strName = jsonClass["name"].get<std::string>();
	m_catalog = new ClassCatalog();
}

void Class::operator=(const Class& rhsClass) {
	m_strID = rhsClass.m_strID;
	m_strName = rhsClass.m_strName;
	m_catalog = new ClassCatalog(*rhsClass.m_catalog);
}

const std::string Class::GetClassHourID(const int p_nDay, const int p_nHour) {
	return m_catalog->GetClassHourID(p_nDay, p_nHour);
}

const std::string Class::GetTeacherID(const int p_nDay, const int p_nHour) {
	if (m_catalog->IsFreeDay(p_nDay, p_nHour))
		return "";
	return g_classHours[m_catalog->GetClassHourID(p_nDay, p_nHour)].GetTeacherID();
}

const std::string Class::GetLocationID(const int p_nDay, const int p_nHour) {
	if (m_catalog->IsFreeDay(p_nDay, p_nHour))
		return "";
	return m_catalog->GetLocationID(p_nDay, p_nHour);
}