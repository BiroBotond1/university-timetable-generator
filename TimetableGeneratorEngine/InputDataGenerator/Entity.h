#pragma once

class Entity
{
public:
	Entity() : m_id(GenerateMongoObjectId()) {};

	const std::string& GetId() const { return m_id; }

protected:
	std::string m_id;

private:
	std::string GenerateMongoObjectId();
};