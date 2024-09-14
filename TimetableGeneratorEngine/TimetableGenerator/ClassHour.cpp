#include "stdafx.h"
#include "ClassHour.h"
#include "Global.h"
#include "Random.h"

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
	Time time;
	std::string strLocationID;
	for (int i = 0; i < m_nNumber; i++) {
		do {
			time = Time{ Random::GetInt(0, DAY_COUNT - 1), Random::GetInt(0, HOUR_COUNT - 1)};
			if (HasLocation())
				strLocationID = g_subjects[m_strSubjectID].GetRandomLocationID();
		} while (!g_classes[m_strClassID].IsFreeDay(time) || !g_teachers[m_strTeacherID].IsFreeDay(time)
			|| (HasLocation() && !g_locations[strLocationID].IsFreeDay(time)));

		if (HasLocation()) {
			g_locations[strLocationID].Add(time, m_strID);
			g_classes[m_strClassID].SetClassHour(m_strID, strLocationID, time);
			g_teachers[m_strTeacherID].SetClassHour(m_strID, strLocationID, time);
			g_teachers[m_strTeacherID].SetClassHour(m_strID, strLocationID, time);
			continue;
		} 

		g_classes[m_strClassID].Add(time, m_strID);
		g_teachers[m_strTeacherID].Add(time, m_strID);
	}
} 