#pragma once

#include "stdafx.h"

class Course {
	std::string				m_strName;

public:
	Course(const nlohmann::json &jsonCourse);
	std::string GetName();
};