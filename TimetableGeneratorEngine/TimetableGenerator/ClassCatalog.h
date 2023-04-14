#pragma once
#include "stdafx.h"
#include "Catalog.h"

class ClassCatalog : public Catalog
{
	int m_nCourseNumber;
public:
	ClassCatalog();
	double GetFitnessValue() override;
};