#include "ClassHour.h"
#include "Global.h"
#include "HelperFunctions.h"

ClassHour::ClassHour(const nlohmann::json& jsonHour) {
	m_strID = jsonHour["_id"].get<std::string>();
	m_nNumber = jsonHour["number"];
	m_strTeacherID = jsonHour["teacher"]["_id"].get<std::string>();
	m_strClassID = jsonHour["class"]["_id"].get<std::string>();
	m_strSubjectID = jsonHour["subject"]["_id"].get<std::string>();
	m_dWeight = jsonHour["weight"];
}

const bool ClassHour::HasLocation() {
	return g_subjects[m_strSubjectID].HasLocations();
}

void ClassHour::AddClassHoursToCatalog() {
	int day, hour; 
	std::string strLocationID;
	for (int i = 0; i < m_nNumber; i++) {
		do {
			day = RandInt(0, DAY_COUNT-1);
			hour = RandInt(0, HOUR_COUNT-1);
			if (HasLocation())
				strLocationID = g_subjects[m_strSubjectID].GetRandomLocationID();
		} while (!g_classes[m_strClassID].IsFreeDay(day, hour) || !g_teachers[m_strTeacherID].IsFreeDay(day, hour)
			|| (HasLocation() && !g_locations[strLocationID].IsFreeDay(day, hour)));

		if (HasLocation()) {
			g_locations[strLocationID].Add(day, hour, m_strID);
			g_classes[m_strClassID].SetClassHour(m_strID, strLocationID, day, hour);
			g_teachers[m_strTeacherID].SetClassHour(m_strID, strLocationID, day, hour);
			g_teachers[m_strTeacherID].SetClassHour(m_strID, strLocationID, day, hour);
			return;
		} 

		g_classes[m_strClassID].Add(day, hour, m_strID);
		g_teachers[m_strTeacherID].Add(day, hour, m_strID);		
	}
} 