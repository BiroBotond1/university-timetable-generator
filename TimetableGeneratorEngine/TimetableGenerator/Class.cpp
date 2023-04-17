#include "Class.h"
#include "global.h"

Class::Class() {

}

Class::Class(const nlohmann::json& jsonClass) {
	m_strID = jsonClass["_id"].get<std::string>();
	m_strName = jsonClass["name"].get<std::string>();
}

bool Class::IsFreeDay(int p_nDay, int p_nHour) {
	return m_catalog.IsFreeDay(p_nDay, p_nHour);
}

void Class::Add(int p_nDay, int p_nHour, std::string p_strSubCourseID) {
	m_catalog.Add(p_nDay, p_nHour, p_strSubCourseID);
}

double Class::GetFitnessValue() {
	return m_catalog.GetFitnessValue();
}

ClassCatalog	Class::GetCatalog() {
	return m_catalog;
}

std::string Class::GetClassHourID(int p_nDay, int p_nHour) {
	return m_catalog.GetClassHourID(p_nDay, p_nHour);
}

void Class::Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) {
	m_catalog.Change(p_nDay1, p_nHour1, p_nDay2, p_nHour2);
}

std::string	Class::GetTeacherID(int p_nDay, int p_nHour) {
	if (m_catalog.IsFreeDay(p_nDay, p_nHour))
		return "";
	return g_classHours[m_catalog.GetClassHourID(p_nDay, p_nHour)].GetTeacherID();
}

std::string Class::GetLocationID(int p_nDay, int p_nHour) {
	if (m_catalog.IsFreeDay(p_nDay, p_nHour))
		return "";
	return g_classHours[m_catalog.GetClassHourID(p_nDay, p_nHour)].GetLocationID();
}

void Class::SetClassHour(ClassHour p_classHour, int p_nDay, int p_nHour) {
	m_catalog.SetClassHour(p_classHour, p_nDay, p_nHour);
}