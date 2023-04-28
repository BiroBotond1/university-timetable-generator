#pragma once

#include "stdafx.h"

class Entity
{
protected:
	std::string m_strID;
public:
	Entity() {}
	Entity(std::string p_strID) : m_strID(p_strID) {}
	std::string GetID() { return m_strID; }
};

