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
	ClassHour():m_nNumber(0), m_dWeight(0.0) {};
	ClassHour(const nlohmann::json& jsonHour);
	void	AddClassHoursToCatalog(); 
	const std::string GetSubjectID() { return m_strSubjectID; }
	const std::string GetTeacherID() { return m_strTeacherID; }
	const std::string GetClassID() { return m_strClassID; }
	const double GetWeight() { return m_dWeight; }
	const bool HasLocation();
};