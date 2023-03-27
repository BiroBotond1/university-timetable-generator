#pragma once

#include "stdafx.h"
#include "DateTime.h"
#include "Catalog.h"

class Teacher {
	std::string				m_strName;
	std::vector<DateTime> 	m_ineligibleDays;
	Catalog					m_catalog;
	void AddIneligibleDay(DateTime dateTime);
public:
	Teacher();
	Teacher(const nlohmann::json &jsonTeacher);
	std::string GetName();
	Catalog GetCatalog();
};
