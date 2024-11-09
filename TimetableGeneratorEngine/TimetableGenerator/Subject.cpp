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

std::shared_ptr<Subject> Subject::Clone(const LocationMap& p_MapLocations) const
{
	auto clonedSubject = std::make_shared<Subject>(*this);

	for (int i = 0; i < m_locations.size(); i++)
	{
		if (auto location = m_locations[i].lock())
		{
			clonedSubject->m_locations[i] = p_MapLocations.at(location->GetId()); //corresponds to a cloned pointer
		}
		else
		{
			assert(false);
		}
	}

	return clonedSubject;
}

std::shared_ptr<Location> Subject::GetRandomLocation() const
{
	auto location = m_locations[Random::GetInt(0, int(m_locations.size() - 1))].lock();

	return location;
}
