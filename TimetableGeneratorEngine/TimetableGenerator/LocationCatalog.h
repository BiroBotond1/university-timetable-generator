#pragma once
#include "stdafx.h"
#include "Catalog.h"

class LocationCatalog : public Catalog
{
private:
	std::string m_strLocationID;
public:
	LocationCatalog();
	LocationCatalog(std::string p_strLocationID);
	double GetFitnessValue() override;
};

