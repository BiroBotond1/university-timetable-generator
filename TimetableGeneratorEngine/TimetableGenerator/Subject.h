#pragma once
#include "stdafx.h"

class Subject
{
	int					m_nID;
	std::string			m_strName;
	std::vector<int>	m_locationIDs;
public:
	Subject(const nlohmann::json& jsonSubject);
	std::string GetName();
	std::string	ToString();
	bool HasLocations();
	int GetRandomLocationID();
};

