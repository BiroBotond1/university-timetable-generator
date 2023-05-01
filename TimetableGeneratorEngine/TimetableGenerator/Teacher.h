#pragma once

#include "stdafx.h"
#include "TeacherCatalog.h"
#include "EntityWithCatalog.h"

class Teacher: public EntityWithCatalog 
{
	std::vector<std::pair<int, int>> 	m_vInappropriateDates;
public:
	Teacher() {}
	Teacher(const nlohmann::json& jsonTeacher);
	std::vector<std::pair<int, int>> 	GetInappropriateDates();
	void operator=(const Teacher& rhsTeacher);
};