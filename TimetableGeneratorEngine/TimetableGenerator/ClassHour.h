#pragma once
#include "stdafx.h"

class ClassHour
{
	std::string m_strID;
	std::string m_strTeacherID;
	std::string m_strClassID;
	std::string m_strSubjectID;
	int m_nNumber;
	double m_dWeight;
public:
	ClassHour();
	ClassHour(const nlohmann::json& jsonHour);
	void AddClassHoursToCatalog();
	std::string GetID();
	std::string GetSubjectID();
	std::string GetTeacherID();
	std::string GetClassID();
	bool HasLocation();
};