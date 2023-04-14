#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"

class Catalog
{
protected:
	std::vector<std::vector<std::string>> m_catalog;
public:
	Catalog();
	bool IsFreeDay(int p_nDay, int p_nHour);
	void Add(int p_nDay, int p_nHour, std::string p_strSubCourseID);
	virtual double GetFitnessValue() = 0;
	void Write();
	std::string GetClassHourID(int p_nDay, int p_nHour);
	void Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2);
	void SetClassHourID(int p_nDay, int p_nHour, std::string p_strClassHourID);
	nlohmann::json GetJSONObj();
};