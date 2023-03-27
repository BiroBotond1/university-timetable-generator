#include "Location.h"

Location::Location() {};

Location::Location(const nlohmann::json &jsonSubCourse) {
	m_strName = jsonSubCourse["name"].get<std::string>();
}

Catalog Location::GetCatalog() {
	return m_catalog;
}

std::string Location::GetName() {
	return m_strName;
}