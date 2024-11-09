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

	clonedSubject->ChangePointers(p_MapLocations);

	return clonedSubject;
}

void Subject::ChangePointers(const LocationMap& p_MapLocations)
{
	for (auto& location : m_locations)
	{
		location = p_MapLocations.at(location.lock()->GetId()); //corresponds to a cloned pointer
	}
}

std::shared_ptr<Location> Subject::GetRandomLocation() const
{
	auto location = m_locations[Random::GetInt(0, int(m_locations.size() - 1))].lock();

	return location;
}
