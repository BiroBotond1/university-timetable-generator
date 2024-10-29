#include "stdafx.h"
#include "Subject.h"
#include "Random.h"
#include "Location.h"

Subject::Subject(const nlohmann::json& jsonSubject, LocationMap& p_locations) : EntityWithName(jsonSubject)
{
	for (const auto& location : jsonSubject["locations"])
	{
		auto locationId = location["_id"].get<std::string>();
		m_locations.push_back(p_locations[locationId]);
	}
}

std::shared_ptr<Subject> Subject::Clone(const LocationMap& p_locations) const
{
	Subject clonedSubject = *this;

	for (int i = 0; i < m_locations.size(); i++)
	{
		clonedSubject.m_locations[i] = p_locations.at(m_locations[i]->GetId()); //corresponds to a cloned pointer
	}

	return std::make_shared<Subject>(clonedSubject);
}

std::shared_ptr<Location> Subject::GetRandomLocation() const
{
	return m_locations[Random::GetInt(0, int(m_locations.size() - 1))];
}
