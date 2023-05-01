#pragma once
#include "stdafx.h"
#include "Catalog.h"

class TeacherCatalog : public Catalog
{
private:
	std::string m_strTeacherID;
public:
	TeacherCatalog();
	TeacherCatalog(const Catalog& rhsTeacherCatalog, std::string p_strTeacherID);
	TeacherCatalog(std::string p_strTeacherID);
	double GetFitnessValue() override;
};

