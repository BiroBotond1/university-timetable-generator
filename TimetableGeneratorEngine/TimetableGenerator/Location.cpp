#include "Location.h"
#include "Global.h"

Location::Location() {};

Location::Location(const nlohmann::json &jsonLocation) {
	m_strID = jsonLocation["_id"].get<std::string>();
	m_catalog = LocationCatalog{ m_strID };
	m_strName = jsonLocation["name"].get<std::string>();
	int nDay = 0, nHour;
	for (auto hours : jsonLocation["reservedDates"])
	{
		nHour = 0;
		for (auto valid : hours)
		{
			if (valid == -1)
				m_vReservedDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}
		nDay++;
	}
}

bool Location::IsFreeDay(int p_nDay, int p_nHour) {
	return m_catalog.IsFreeDay(p_nDay, p_nHour);
}

void Location::Add(int p_nDay, int p_nHour, std::string p_strSubCourseID) {
	m_catalog.Add(p_nDay, p_nHour, p_strSubCourseID);
}

double Location::GetFitnessValue() {
	return m_catalog.GetFitnessValue();
}

std::vector<std::pair<int, int>> Location::GetReservedDates() {
	return m_vReservedDates;
}

LocationCatalog Location::GetCatalog() {
	return m_catalog;
}

void Location::Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) {
	m_catalog.Change(p_nDay1, p_nHour1, p_nDay2, p_nHour2);
}
/*

std::string Location::GetName() {
	return m_strName;
}

int Location::GetClassHourID(int day1, int hour1) {
	return m_catalog.GetClassHourID(day1, hour1);
}

void Location::SetClassHourID(int day, int hour, int classHour) {
	return m_catalog.SetClassHourID(day, hour, classHour);
}*/