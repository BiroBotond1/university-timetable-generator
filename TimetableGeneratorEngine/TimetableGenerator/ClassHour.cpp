#include "ClassHour.h"
#include "Global.h"
#include "HelperFunctions.h"

ClassHour::ClassHour(const nlohmann::json& jsonHour) {
	m_nID = jsonHour["id"];
	m_nNumber = jsonHour["number"];
	m_nTeacherID = jsonHour["teacherID"];
	m_nClassID = jsonHour["classID"];
	m_nSubjectID = jsonHour["subjectID"];
	if (g_subjects[m_nSubjectID].HasLocations()) {
		m_nLocationID = g_subjects[m_nSubjectID].GetRandomLocationID();
	}
	else {
		m_nLocationID = g_classes[m_nClassID].GetLocationID();
	}
	g_classes[m_nClassID].IncrementCourseNumber();
}

int ClassHour::GetTeacherID() {
	return m_nTeacherID;
}

int ClassHour::GetClassID() {
	return m_nClassID;
}

int ClassHour::GetSubjectID() {
	return m_nSubjectID;
}

int ClassHour::GetLocationID() {
	return m_nLocationID;
}

void ClassHour::AddClassHoursToCatalog(int classHourID) {
	int day, hour;
	for (int i = 0; i < m_nNumber; i++) {
		do {
			day = RandInt(0, 4);
			hour = RandInt(0, 7);
		} while (!g_classes[m_nClassID].IsFreeDay(day, hour) || !g_teachers[m_nTeacherID].IsFreeDay(day, hour)
			|| !g_locations[m_nLocationID].IsFreeDay(day, hour));
		g_classes[m_nClassID].Add(day, hour, classHourID);
		g_teachers[m_nTeacherID].Add(day, hour, classHourID);
		g_locations[m_nLocationID].Add(day, hour, classHourID);
	}
} 

std::string ClassHour::ToString() {
	return g_subjects[m_nSubjectID].ToString();
}