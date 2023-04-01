#include "Class.h"
#include "global.h"

Class::Class(const nlohmann::json& jsonClass) {
	m_nID = jsonClass["id"];
	m_strName = jsonClass["name"].get<std::string>();
	m_nLocationID = jsonClass["locationID"];
}

std::string Class::GetName() {
	return m_strName;
}

int Class::GetLocationID() {
	return m_nLocationID;
}

ClassCatalog	Class::GetCatalog() {
	return m_catalog;
}

bool Class::IsFreeDay(int day, int hour) {
	return m_catalog.IsFreeDay(day, hour);
}

void Class::Add(int day, int hour, int subCourseID) {
	m_catalog.Add(day, hour, subCourseID);
}

double Class::GetFitnessValue() {
	return m_catalog.GetFitnessValue();
}

void Class::IncrementCourseNumber() {
	m_catalog.IncrementCourseNumber();
}

void Class::Change(int day1, int hour1, int day2, int hour2) {
	m_catalog.Change(day1, hour1, day2, hour2);
}

int	Class::GetTeacherID(int day, int hour) {
	if (m_catalog.GetClassHourID(day, hour) == -1)
		return -1;
	return g_classHours[m_catalog.GetClassHourID(day, hour)].GetTeacherID();
}

int	Class::GetLocationID(int day, int hour) {
	if (m_catalog.GetClassHourID(day, hour) == -1)
		return -1;
	return g_classHours[m_catalog.GetClassHourID(day, hour)].GetLocationID();
}

int Class::GetClassHourID(int day, int hour) {
	return m_catalog.GetClassHourID(day, hour);
}