#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"

class Catalog
{
protected:
	std::vector<std::vector<int>> m_catalog;
public:
	Catalog();
	bool IsFreeDay(int day, int hour);
	void Write();
	void Add(int day, int hour, int subCourseID);
	virtual double GetFitnessValue() = 0;
	void Change(int day1, int hour1, int day2, int hour2);
	int GetClassHourID(int day, int hour);
	void SetClassHourID(int day, int hour, int classHour);
};