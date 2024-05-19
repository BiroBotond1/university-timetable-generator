#pragma once

#include "stdafx.h"
#include "EntityWithName.h"
#include "Catalog.h"

class EntityWithCatalog : public EntityWithName
{
protected:
	Catalog m_catalog;
public:
	EntityWithCatalog() {}
	const bool IsFreeDay(Time p_time) { return m_catalog.IsFreeDay(p_time); }
	void Add(Time p_time, const std::string p_strClassHourID) { m_catalog.Add(p_time, p_strClassHourID); }
	std::tuple<double, bool> EvaluateClass() { return m_catalog.EvaluateClassCatalog(); }
	std::tuple<double, bool> EvaluateTeacher(std::string p_strTeacherID) { return m_catalog.EvaluateTeacherCatalog(p_strTeacherID); }
	std::tuple<double, bool> EvaluateLocation(std::string p_strLocationID) { return m_catalog.EvaluateLocationCatalog(p_strLocationID); }
	Catalog& GetCatalog() { return m_catalog; }
	const void Change(Time p_time1, Time p_time2) {
		m_catalog.Swap(p_time1, p_time2); }
	void SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, Time p_time) {
		m_catalog.SetClassHour(p_strClassHourID, p_strLocationID, p_time);
	}
	~EntityWithCatalog() {};
};

