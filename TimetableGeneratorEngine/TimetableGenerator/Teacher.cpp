#include "Teacher.h"
#include "Global.h"

Teacher::Teacher() {};

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_strID = jsonTeacher["_id"].get<std::string>();
	m_catalog = TeacherCatalog{ m_strID };
	m_strName = jsonTeacher["name"].get<std::string>();
	int nDay = 0, nHour;
	for (auto hours : jsonTeacher["inappropriateDates"])
	{
		nHour = 0;
		for(auto valid : hours)
		{
			if(valid == -1)
				m_vInappropriateDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}	
		nDay++;
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

void Teacher::SetClassHour(std::string p_strClassHourID, std::string p_strLocationID, int p_nDay, int p_nHour) {
	m_catalog.SetClassHour(p_strClassHourID, p_strLocationID, p_nDay, p_nHour);
}