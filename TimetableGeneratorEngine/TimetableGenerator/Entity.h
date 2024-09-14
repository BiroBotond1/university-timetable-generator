#pragma once

class Entity
{
protected:
	std::string m_strID;
public:
	Entity() {}
	Entity(const std::string p_strID) : m_strID(p_strID) {}
	const std::string GetID() { return m_strID; }
};

