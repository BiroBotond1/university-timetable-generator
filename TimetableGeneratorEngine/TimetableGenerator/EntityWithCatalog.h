#pragma once

#include "stdafx.h"
#include "EntityWithName.h"
#include "Catalog.h"

class EntityWithCatalog : public EntityWithName
{
protected:
	Catalog* m_catalog;
public:
	EntityWithCatalog() {}
	//EntityWithCatalog(std::string p_strID, std::string p_strName, std::unique_ptr<Catalog> p_catalog)
	//	: EntityWithName(p_strID, p_strName), m_catalog(p_catalog) {}
	bool IsFreeDay(int p_nDay, int p_nHour) { return m_catalog->IsFreeDay(p_nDay, p_nHour); }
	void Add(int p_nDay, int p_nHour, std::string p_strClassHourID) { m_catalog->Add(p_nDay, p_nHour, p_strClassHourID); }
	double GetFitnessValue() { return m_catalog->GetFitnessValue(); }
	Catalog* GetCatalog() { return m_catalog; }
	void Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2) { m_catalog->Change(p_nDay1, p_nHour1, p_nDay2, p_nHour2); }
	void SetClassHour(std::string p_strClassHourID, std::string p_strLocationID, int p_nDay, int p_nHour) {
		m_catalog->SetClassHour(p_strClassHourID, p_strLocationID, p_nDay, p_nHour);
	}
	~EntityWithCatalog() {};
};

