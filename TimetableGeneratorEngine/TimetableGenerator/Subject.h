#pragma once
#include "stdafx.h"
#include "EntityWithName.h"

class Subject : public EntityWithName
{
	std::vector<std::string>	m_locationIDs;
public:
	Subject() {}
	Subject(const nlohmann::json& jsonSubject);
	const bool HasLocations() { return !m_locationIDs.empty(); }
	const std::string GetRandomLocationID();
};

