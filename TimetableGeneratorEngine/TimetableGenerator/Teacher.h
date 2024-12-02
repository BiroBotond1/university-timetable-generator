#pragma once
#include "EntityWithCatalog.h"

class Teacher: public EntityWithCatalog 
{
public:
	Teacher(const nlohmann::json& jsonTeacher, const TimetableConfig& p_config);
	Teacher(const Teacher& p_teacher) : m_vInappropriateDates(p_teacher.m_vInappropriateDates), EntityWithCatalog(p_teacher.m_id, p_teacher.m_name, p_teacher.m_catalog) {}

	std::shared_ptr<Teacher> Clone() const;

	std::tuple<double, bool> Evaluate() override;

	const std::vector<std::pair<int, int>>& GetInappropriateDates() const;

private:
	std::vector<std::pair<int, int>> m_vInappropriateDates;
};