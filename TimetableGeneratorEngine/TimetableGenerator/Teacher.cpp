#include "Teacher.h"

Teacher::Teacher() {};

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_nID = jsonTeacher["id"];
	m_catalog = TeacherCatalog{m_nID};
	m_strName = jsonTeacher["name"].get<std::string>();
	if (jsonTeacher.contains("ineligibleDates")) {
		for (auto ineligibleDates : jsonTeacher["ineligibleDates"])
		{
			int day = ineligibleDates["day"];
			int hour = ineligibleDates["hour"];
			m_ineligibleDates.push_back(std::make_pair(day, hour));
		}
	}
	if (jsonTeacher.contains("fixedDays")) {
		for (auto fixedDate : jsonTeacher["fixedDates"])
		{
			int day = fixedDate["day"];
			int hour = fixedDate["hour"];
			m_fixedDates.push_back(std::make_pair(day, hour));
		}
	}
}

std::string Teacher::GetName() {
	return m_strName;
}

TeacherCatalog Teacher::GetCatalog() {
	return m_catalog;
}

bool Teacher::IsFreeDay(int day, int hour) {
	return m_catalog.IsFreeDay(day, hour);
}

void Teacher::Add(int day, int hour, int subCourseID) {
	m_catalog.Add(day, hour, subCourseID);
}

std::vector<std::pair<int, int>> Teacher::GetIneligibleDays() {
	return m_ineligibleDates;
}

void Teacher::Change(int day1, int hour1, int day2, int hour2) {
	m_catalog.Change(day1, hour1, day2, hour2);
}

int Teacher::GetClassHourID(int day1, int hour1) {
	return m_catalog.GetClassHourID(day1, hour1);
}

void Teacher::SetClassHourID(int day, int hour, int classHour) {
	return m_catalog.SetClassHourID(day, hour, classHour);
}