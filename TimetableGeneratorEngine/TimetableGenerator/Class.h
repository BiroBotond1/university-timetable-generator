#pragma once
#include "stdafx.h"
#include "ClassCatalog.h"

class Class
{
	std::string			m_strID;
	std::string			m_strName;
	ClassCatalog		m_catalog;
public:
	Class();
	Class(const nlohmann::json& jsonClass);
	bool				IsFreeDay(int p_nDay, int p_nHour);
	void				Add(int p_nDay, int p_nHour, std::string p_strSubCourseID);
	double				GetFitnessValue();
	ClassCatalog		GetCatalog();
	std::string			GetClassHourID(int p_nDay, int p_nHour);
	void				Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2);
	std::string			GetTeacherID(int p_nDay, int p_nHour);
	std::string			GetLocationID(int p_nDay, int p_nHour);
	void				SetClassHour(std::string p_strClassHourID, std::string p_strLocationID, int p_nDay, int p_nHour);
};

