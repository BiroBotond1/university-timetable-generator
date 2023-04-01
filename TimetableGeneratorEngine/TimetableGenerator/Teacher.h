#pragma once

#include "stdafx.h"
#include "TeacherCatalog.h"

class Teacher {
	int									m_nID;
	std::string							m_strName;
	std::vector<std::pair<int, int>> 	m_fixedDates;
	std::vector<std::pair<int, int>> 	m_ineligibleDates;
	TeacherCatalog						m_catalog;
public:
	Teacher();
	Teacher(const nlohmann::json& jsonTeacher);
	std::string							GetName();
	TeacherCatalog						GetCatalog();
	bool								IsFreeDay(int day, int hour);
	void								Add(int day, int hour, int subCourseID);
	std::vector<std::pair<int, int>> 	GetIneligibleDays();
	void								Change(int day1, int hour1, int day2, int hour2);
	int									GetClassHourID(int day1, int hour1);
	void								SetClassHourID(int day, int hour, int classHour);
};