#pragma once
#include "stdafx.h"
#include "ClassCatalog.h"

class Class
{
	int					m_nID;
	std::string			m_strName;
	int					m_nLocationID;
	ClassCatalog		m_catalog;
public:
	Class(const nlohmann::json& jsonClass);
	std::string			GetName();
	int					GetLocationID();
	ClassCatalog		GetCatalog();
	bool				IsFreeDay(int day, int hour);
	void				Add(int day, int hour, int subCourseID);
	double				GetFitnessValue();
	void				IncrementCourseNumber();
	void				Change(int day1, int hour1, int day2, int hour2);
	int					GetTeacherID(int day, int hour);
	int					GetLocationID(int day, int hour);
	int					GetClassHourID(int day, int hour);
};

