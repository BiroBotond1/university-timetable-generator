#pragma once

#include "stdafx.h"
#include "Entity.h"

class EntityWithName : public Entity
{
protected:
	std::string m_strName;
public:
	EntityWithName() {}
	EntityWithName(std::string p_strID, std::string p_strName) : Entity(p_strID), m_strName(p_strName) {}
};

