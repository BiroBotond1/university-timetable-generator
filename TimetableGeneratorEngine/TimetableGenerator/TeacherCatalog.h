#pragma once
#include "stdafx.h"
#include "Catalog.h"

class TeacherCatalog : public Catalog
{
private:
	std::string m_strTeacherID;
public:
	TeacherCatalog();
	TeacherCatalog(const Catalog& rhsTeacherCatalog, const std::string p_strTeacherID);
	TeacherCatalog(const std::string p_strTeacherID);
	std::tuple<double, bool> Evaluate() override;
};

