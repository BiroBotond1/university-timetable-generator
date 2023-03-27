#pragma once
#include "stdafx.h"

class Group
{
	std::string				m_strName;
	std::vector<int>		m_vInvalidGroupIDs;
public:
	Group(const nlohmann::json& jsonGroup);
	std::vector<int>	GetInvalidGroupIDs();
	bool				IsValidityWithGroup(int p_nGroupID);
	std::string GetName();
};

