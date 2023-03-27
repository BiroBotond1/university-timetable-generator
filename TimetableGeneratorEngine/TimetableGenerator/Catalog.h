#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"

class Catalog
{
	std::vector<std::vector<std::vector<std::vector<int>>>> m_catalog;
public:
	Catalog();
	bool IsFreeDay(CoursePeriod eCoursePeriod, int day, int hour, int week, int p_nGroupID);
	bool HasInvalidGroup(int p_nGroupID, std::vector<int> subCourseIDs);
	void Add(CoursePeriod eCoursePeriod, int day, int hour, int week, int subCourseID);
	void Write();
};