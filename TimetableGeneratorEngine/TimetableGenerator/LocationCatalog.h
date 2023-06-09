#pragma once
#include "stdafx.h"
#include "Catalog.h"

class LocationCatalog : public Catalog
{
private:
	std::string m_strLocationID;
public:
	LocationCatalog();
	LocationCatalog(const std::string p_strLocationID);
	LocationCatalog(const Catalog& rhsLocationCatalog, const std::string p_strLocationID);
	std::tuple<double, bool> Evaluate() override;
};

