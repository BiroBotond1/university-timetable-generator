#pragma once

class Entity
{
public:
	Entity() : m_id(GenerateMongoObjectId()) {};

	const std::string& GetId() const { return m_id; }

	virtual json GetJson() const = 0;

protected:
	std::string m_id;

private:
	std::string GenerateMongoObjectId();
};