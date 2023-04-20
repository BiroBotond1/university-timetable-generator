#pragma once
#include "stdafx.h"

class Subject
{
	std::string					m_strID;
	std::string					m_strName;
	std::vector<std::string>	m_locationIDs;
public:
	Subject();
	Subject(const nlohmann::json& jsonSubject);
	bool HasLocations();
	std::string GetRandomLocationID();
};

