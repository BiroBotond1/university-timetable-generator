#pragma once

#include "EntityWithName.h"
#include "Catalog.h"

class ClassHour;
class Location;

class EntityWithCatalog : public EntityWithName
{
public:
	EntityWithCatalog(const nlohmann::json& p_json, const TimetableConfig& p_config) : EntityWithName(p_json), m_catalog(p_config) {}
	EntityWithCatalog(const std::string& p_id, const std::string& p_name, const Catalog& p_catalog) : m_catalog(p_catalog), EntityWithName(p_id, p_name) {}

	const bool	IsFreeDay(Time p_time) { return m_catalog.IsFreeDay(p_time); }

	virtual std::tuple<double, bool> Evaluate() = 0;

	Catalog& GetCatalog() { return m_catalog; }

	const void	Change(Time p_time1, Time p_time2) { m_catalog.Swap(p_time1, p_time2); }

	void		Add(Time p_time, std::shared_ptr<ClassHour> p_classHour) { m_catalog.Add(p_time, p_classHour); }
	void		SetClassHour(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_time) 
	{
		m_catalog.SetClassHour(p_classHour, p_location, p_time);
	}

	virtual ~EntityWithCatalog() = default;

protected:
	Catalog m_catalog;
};

