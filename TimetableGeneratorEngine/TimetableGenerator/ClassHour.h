#pragma once
#include "stdafx.h"

class ClassHour
{
	std::string m_strID;
	std::string m_strTeacherID;
	std::string m_strClassID;
	std::string m_strSubjectID;
	std::string m_strLocationID;
	int m_nNumber;
	double m_dWeight;
public:
	ClassHour();
	ClassHour(const nlohmann::json& jsonHour);
	void AddClassHoursToCatalog();
	bool HasLocation();
	std::string ToString();
	std::string GetID();
	std::string GetSubjectID();
	std::string GetTeacherID();
	std::string GetClassID();
	std::string GetLocationID();
	void SetLocationID(std::string p_strLocationID);
};