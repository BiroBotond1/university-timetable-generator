#pragma once
#include "stdafx.h"
#include "Catalog.h"

class ClassCatalog : public Catalog
{
	int m_nCourseNumber;
public:
	ClassCatalog();
	void AddCourseNumberOnADay(std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double GetFitnessValue() override;
};