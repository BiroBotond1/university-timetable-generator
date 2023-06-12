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
	const bool IsFreeDay(const int p_nDay, const int p_nHour) { return m_catalog.IsFreeDay(p_nDay, p_nHour); }
	void Add(const int p_nDay, const int p_nHour, const std::string p_strClassHourID) { m_catalog.Add(p_nDay, p_nHour, p_strClassHourID); }
	std::tuple<double, bool> EvaluateClass() { return m_catalog.EvaluateClassCatalog(); }
	std::tuple<double, bool> EvaluateTeacher(std::string p_strTeacherID) { return m_catalog.EvaluateTeacherCatalog(p_strTeacherID); }
	std::tuple<double, bool> EvaluateLocation(std::string p_strLocationID) { return m_catalog.EvaluateLocationCatalog(p_strLocationID); }
	Catalog& GetCatalog() { return m_catalog; }
	const void Change(const int p_nDay1, const int p_nHour1, const int p_nDay2, const int p_nHour2) {
		m_catalog.Swap(p_nDay1, p_nHour1, p_nDay2, p_nHour2); }
	void SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, const int p_nDay, const int p_nHour) {
		m_catalog.SetClassHour(p_strClassHourID, p_strLocationID, p_nDay, p_nHour);
	}
	~EntityWithCatalog() {};
};

