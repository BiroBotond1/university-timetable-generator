#pragma once

#include "stdafx.h"
#include "EntityWithName.h"
#include "Catalog.h"

class EntityWithCatalog : public EntityWithName
{
protected:
	std::unique_ptr<Catalog> m_catalog;
public:
	EntityWithCatalog() {}
	//EntityWithCatalog(std::string p_strID, std::string p_strName, std::unique_ptr<Catalog> p_catalog)
	//	: EntityWithName(p_strID, p_strName), m_catalog(p_catalog) {}
	const bool IsFreeDay(const int p_nDay, const int p_nHour) { return m_catalog->IsFreeDay(p_nDay, p_nHour); }
	void Add(const int p_nDay, const int p_nHour, const std::string p_strClassHourID) { m_catalog->Add(p_nDay, p_nHour, p_strClassHourID); }
	const double GetFitnessValue() { return m_catalog->GetFitnessValue(); }
	std::unique_ptr<Catalog>& GetCatalog() { return m_catalog; }
	const void Change(const int p_nDay1, const int p_nHour1, const int p_nDay2, const int p_nHour2) {
		m_catalog->Swap(p_nDay1, p_nHour1, p_nDay2, p_nHour2); }
	void SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, const int p_nDay, const int p_nHour) {
		m_catalog->SetClassHour(p_strClassHourID, p_strLocationID, p_nDay, p_nHour);
	}
	~EntityWithCatalog() {};
};

