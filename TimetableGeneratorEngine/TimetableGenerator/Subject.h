#pragma once
#include "EntityWithName.h"

class Location;

using LocationMap = std::unordered_map<std::string, std::shared_ptr<Location>>;

class Subject : public EntityWithName
{
public:
	Subject(const nlohmann::json& jsonSubject, LocationMap& p_locations);
	Subject(const Subject& p_subject) : m_locations(p_subject.m_locations), EntityWithName(p_subject.m_id, p_subject.m_name) {};

	std::shared_ptr<Subject> Clone(const LocationMap& p_locations) const;

	bool						HasLocations() const { return !m_locations.empty(); }
	std::shared_ptr<Location>	GetRandomLocation() const;

private:
	std::vector<std::shared_ptr<Location>>	m_locations;
};