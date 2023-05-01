#include "Class.h"
#include "global.h"

Class::Class(const nlohmann::json& jsonClass) {
	m_strID = jsonClass["_id"].get<std::string>();
	m_strName = jsonClass["name"].get<std::string>();
	m_catalog = new ClassCatalog();
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

void Class::operator=(const Class& rhsClass) {
	m_strID = rhsClass.m_strID;
	m_strName = rhsClass.m_strName;
	m_catalog = new ClassCatalog(*rhsClass.m_catalog);
}