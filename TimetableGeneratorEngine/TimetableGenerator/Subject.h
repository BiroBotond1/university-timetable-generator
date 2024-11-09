#pragma once
#include "EntityWithName.h"

class Location;

using LocationMap = std::unordered_map<std::string, std::shared_ptr<Location>>;

class Subject : public EntityWithName
{
public:
	Subject(const nlohmann::json& jsonSubject, LocationMap& p_locations);
	Subject(const Subject& p_subject) : m_locations(p_subject.m_locations), EntityWithName(p_subject.m_id, p_subject.m_name) {};

	std::shared_ptr<Subject> Clone(const LocationMap& p_MapLocations) const;

	bool						HasLocations() const { return !m_locations.empty(); }
	std::shared_ptr<Location>	GetRandomLocation() const;

	void						ChangePointers(const LocationMap& p_MapLocations);

private:
	std::vector<std::weak_ptr<Location>>	m_locations;
};