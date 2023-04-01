#pragma once
#include "stdafx.h"

class ClassHour
{
	int m_nID;
	int m_nTeacherID;
	int m_nClassID;
	int m_nSubjectID;
	int m_nLocationID;
	int m_nNumber;
public:
	ClassHour(const nlohmann::json& jsonHour);
	int GetTeacherID();
	int GetClassID();
	int GetSubjectID();
	int GetLocationID();
	void AddClassHoursToCatalog(int classHourID);
	std::string ToString();
};