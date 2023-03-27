#include "Major.h"
#include "HelperFunctions.h"

Major::Major(const nlohmann::json &jsonMajor) {
	m_strName = jsonMajor["name"].get<std::string>();
	m_nYear = jsonMajor["year"];
}

Catalog& Major::GetCatalog() {
	return m_catalog;
}

std::string Major::GetName() {
	return m_strName;
}