#include "Teacher.h"
#include "Global.h"

Teacher::Teacher() {};

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_strID = jsonTeacher["_id"].get<std::string>();
	m_catalog = TeacherCatalog{ m_strID };
	m_strName = jsonTeacher["name"].get<std::string>();
	int nDay, nHour = 0;
	for (auto ineligibleHour : jsonTeacher["inappropriateDates"].items())
	{
		nDay = 0;
		int nHour = stoi(ineligibleHour.key().substr(0, ineligibleHour.key().find("-"))) - START_HOUR;
		for(auto valid : ineligibleHour.value())
		{
			if(valid == -1)
				m_vInappropriateDates.push_back(std::make_pair(nDay, nHour));
			nDay++;
		}	
		nHour++;
	}
}

bool Teacher::IsFreeDay(int p_nDay, int p_nHour) {
	return m_catalog.IsFreeDay(p_nDay, p_nHour);
}

void Teacher::Add(int p_nDay, int p_nHour, std::string p_strSubCourseID) {
	m_catalog.Add(p_nDay, p_nHour, p_strSubCourseID);
}
double Teacher::GetFitnessValue() {
	return m_catalog.GetFitnessValue();
}

std::vector<std::pair<int, int>> Teacher::GetInappropriateDates() {
	return m_vInappropriateDates;
}

TeacherCatalog Teacher::GetCatalog() {
	return m_catalog;
}

void Teacher::Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) {
	m_catalog.Change(p_nDay1, p_nHour1, p_nDay2, p_nHour2);
}
/*

std::string Teacher::GetName() {
	return m_strName;
}

int Teacher::GetClassHourID(int day1, int hour1) {
	return m_catalog.GetClassHourID(day1, hour1);
}

void Teacher::SetClassHourID(int day, int hour, int classHour) {
	return m_catalog.SetClassHourID(day, hour, classHour);
}
*/