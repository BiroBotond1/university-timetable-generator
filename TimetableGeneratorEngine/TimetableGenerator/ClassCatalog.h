#pragma once
#include "stdafx.h"
#include "Catalog.h"

class ClassCatalog : public Catalog
{
public:
	ClassCatalog();
	ClassCatalog(const Catalog& rhsClassCatalog);
	void AddCourseNumberOnADay(std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double GetFitnessValue() override;
};