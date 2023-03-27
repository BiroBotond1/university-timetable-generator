#pragma once

#include "stdafx.h"
#include "Catalog.h"

class Major
{
	std::string m_strName;
	int m_nYear;
	Catalog m_catalog;
public:
	Major(const nlohmann::json &jsonMajor);
	Catalog& GetCatalog();
	std::string GetName();
};

