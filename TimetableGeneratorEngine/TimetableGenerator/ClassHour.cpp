#include "ClassHour.h"
#include "Global.h"
#include "HelperFunctions.h"

ClassHour::ClassHour() {}

ClassHour::ClassHour(const nlohmann::json& jsonHour) {
	m_strLocationID = "";
	m_strID = jsonHour["_id"].get<std::string>();
	m_nNumber = jsonHour["number"];
	m_strTeacherID = jsonHour["teacher"]["_id"].get<std::string>();
	m_strClassID = jsonHour["class"]["_id"].get<std::string>();
	m_strSubjectID = jsonHour["subject"]["_id"].get<std::string>();
	m_dWeight = jsonHour["weight"];

	if (g_subjects[m_strSubjectID].HasLocations()) {
		m_strLocationID = g_subjects[m_strSubjectID].GetRandomLocationID();
	}
}

bool ClassHour::HasLocation() {
	return m_strLocationID.compare("");
}

std::string ClassHour::GetSubjectID() {
	return m_strSubjectID;
}

std::string ClassHour::GetLocationID() {
	return m_strLocationID;
}

std::string ClassHour::GetTeacherID() {
	return m_strTeacherID;
}

std::string ClassHour::GetClassID() {
	return m_strClassID;
}

void ClassHour::AddClassHoursToCatalog() {
	int day, hour;
	for (int i = 0; i < m_nNumber; i++) {
		do {
			day = RandInt(0, DAY_COUNT-1);
			hour = RandInt(0, HOUR_COUNT-1);
		} while (!g_classes[m_strClassID].IsFreeDay(day, hour) || !g_teachers[m_strTeacherID].IsFreeDay(day, hour)
			|| (HasLocation() && !g_locations[m_strLocationID].IsFreeDay(day, hour)));

		g_classes[m_strClassID].Add(day, hour, m_strID);
		g_teachers[m_strTeacherID].Add(day, hour, m_strID);

		if(HasLocation())
			g_locations[m_strLocationID].Add(day, hour, m_strID);
	}
} 

std::string ClassHour::ToString() {
	return g_subjects[m_strSubjectID].ToString();
}