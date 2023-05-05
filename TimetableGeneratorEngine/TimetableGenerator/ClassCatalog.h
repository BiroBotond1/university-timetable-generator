#pragma once
#include "stdafx.h"
#include "Catalog.h"

class ClassCatalog : public Catalog
{
	const void		AddCourseNumberOnADay(const std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	const double	GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
public:
	ClassCatalog();
	ClassCatalog(const Catalog& rhsClassCatalog);
	const double GetFitnessValue() override;
};