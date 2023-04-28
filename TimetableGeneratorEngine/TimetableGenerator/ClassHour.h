#pragma once
#include "stdafx.h"
#include "Entity.h"

class ClassHour : public Entity
{
	std::string m_strTeacherID;
	std::string m_strClassID;
	std::string m_strSubjectID;
	int m_nNumber;
	double m_dWeight;
public:
	ClassHour() { };
	ClassHour(const nlohmann::json& jsonHour);
	void AddClassHoursToCatalog(); 
	std::string GetSubjectID() { return m_strSubjectID; }
	std::string GetTeacherID() { return m_strTeacherID; }
	std::string GetClassID() { return m_strClassID; }
	bool HasLocation();
};