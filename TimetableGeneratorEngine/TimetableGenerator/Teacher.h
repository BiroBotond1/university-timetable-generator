#pragma once

#include "stdafx.h"
#include "Catalog.h"
#include "EntityWithCatalog.h"

class Teacher: public EntityWithCatalog 
{
	std::vector<std::pair<int, int>> 	m_vInappropriateDates;
public:
	Teacher() {}
	Teacher(const nlohmann::json& jsonTeacher);
	const std::vector<std::pair<int, int>>& 	GetInappropriateDates();
};