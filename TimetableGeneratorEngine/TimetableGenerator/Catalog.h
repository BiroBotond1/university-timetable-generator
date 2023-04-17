#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"
#include "ClassHour.h"

class Catalog
{
protected:
	std::vector<std::vector<ClassHour>> m_catalog;
public:
	Catalog();
	bool IsFreeDay(int p_nDay, int p_nHour);
	void Add(int p_nDay, int p_nHour, std::string p_strClassHourID);
	virtual double GetFitnessValue() = 0;
	void Write();
	std::string GetClassHourID(int p_nDay, int p_nHour);
	void Delete(int p_nDay, int p_nHour);
	void Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2);
	void SetClassHour(ClassHour p_classHour, int p_nDay, int p_nHour);
	nlohmann::json GetJSONObj();
};