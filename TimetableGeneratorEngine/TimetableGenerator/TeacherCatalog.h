#pragma once
#include "stdafx.h"
#include "Catalog.h"

class TeacherCatalog : public Catalog
{
private:
	std::string m_strTeacherID;
public:
	TeacherCatalog();
	TeacherCatalog(std::string p_strTeacherID);
	double GetFitnessValue() override;
};

