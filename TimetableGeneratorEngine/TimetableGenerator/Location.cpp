#include "Location.h"

Location::Location() {};

Location::Location(const nlohmann::json &jsonLocation) {
	m_nID = jsonLocation["id"];
	m_catalog = LocationCatalog{ m_nID };
	m_strName = jsonLocation["name"].get<std::string>();
	if (jsonLocation.contains("reservedDates")) {
		for (auto reservedDate : jsonLocation["reservedDates"])
		{
			int day = reservedDate["day"];
			int hour = reservedDate["hour"];
			m_reservedDates.push_back(std::make_pair(day, hour));
		}
	}
	if (jsonLocation.contains("fixedDays")) {
		for (auto fixedDate : jsonLocation["fixedDates"])
		{
			int day = fixedDate["day"];
			int hour = fixedDate["hour"];
			m_fixedDates.push_back(std::make_pair(day, hour));
		}
	}
}

LocationCatalog Location::GetCatalog() {
	return m_catalog;
}

std::string Location::GetName() {
	return m_strName;
}
bool Location::IsFreeDay(int day, int hour) {
	return m_catalog.IsFreeDay(day, hour);
}

void Location::Add(int day, int hour, int subCourseID) {
	m_catalog.Add(day, hour, subCourseID);
}

void Location::Change(int day1, int hour1, int day2, int hour2) {
	m_catalog.Change(day1, hour1, day2, hour2);
}

int Location::GetClassHourID(int day1, int hour1) {
	return m_catalog.GetClassHourID(day1, hour1);
}

void Location::SetClassHourID(int day, int hour, int classHour) {
	return m_catalog.SetClassHourID(day, hour, classHour);
}

std::vector<std::pair<int, int>> Location::GetReservedDates() {
	return m_reservedDates;
}