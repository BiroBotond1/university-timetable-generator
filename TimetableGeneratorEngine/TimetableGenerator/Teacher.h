#pragma once

#include "stdafx.h"
#include "TeacherCatalog.h"

class Teacher {
	std::string							m_strID;
	std::string							m_strName;
	std::vector<std::pair<int, int>> 	m_vInappropriateDates;
	TeacherCatalog						m_catalog;
public:
	Teacher();
	Teacher(const nlohmann::json& jsonTeacher);
	bool								IsFreeDay(int p_nDay, int p_nHour);
	void								Add(int p_nDay, int p_nHour, std::string p_strSubCourseID);
	double								GetFitnessValue();
	std::vector<std::pair<int, int>> 	GetInappropriateDates();
	TeacherCatalog						GetCatalog();
	void								Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2);
	/*
	std::string							GetName();
	std::string							GetClassHourID(int day1, int hour1);
	void								SetClassHourID(int day, int hour, std::string classHour);
	*/
};