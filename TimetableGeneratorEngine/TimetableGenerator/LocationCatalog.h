#pragma once
#include "stdafx.h"
#include "Catalog.h"

class LocationCatalog : public Catalog
{
private:
	int m_nLocationID;
public:
	LocationCatalog();
	LocationCatalog(int p_nID);
	double GetFitnessValue() override;
};

