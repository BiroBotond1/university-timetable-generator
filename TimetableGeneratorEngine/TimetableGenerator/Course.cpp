#include "Course.h"

Course::Course(const nlohmann::json &jsonCourse) {
	m_strName = jsonCourse["name"].get<std::string>();
}

std::string Course::GetName() {
	return m_strName;
}