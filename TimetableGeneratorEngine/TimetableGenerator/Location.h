#pragma once

#include "stdafx.h"
#include "Catalog.h"

class Location {
	std::string m_strName;
	Catalog		m_catalog;

public:
	Location();
	Location(const nlohmann::json &jsonSubCourse);
	Catalog GetCatalog();
	std::string GetName();
};