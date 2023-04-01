#pragma once
#include "stdafx.h"
#include "Catalog.h"

class TeacherCatalog : public Catalog
{
private:
	int m_nTeacherID;
public:
	TeacherCatalog();
	TeacherCatalog(int p_nTeacherID);
	double GetFitnessValue() override;
};

