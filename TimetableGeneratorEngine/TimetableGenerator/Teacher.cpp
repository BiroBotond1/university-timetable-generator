#include "stdafx.h"
#include "Teacher.h"

Teacher::Teacher(const nlohmann::json& jsonTeacher, const TimetableConfig& p_config) : EntityWithCatalog(jsonTeacher, p_config)
{
	int nDay = 0;
	for (const auto& hours : jsonTeacher["inappropriateDates"])
	{
		int nHour = 0;
		for (const auto& valid : hours)
		{
			if (valid == -1)
				m_vInappropriateDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}
		nDay++;
	}
}

std::shared_ptr<Teacher> Teacher::Clone() const
{
	return std::make_shared<Teacher>(*this);
} 

std::tuple<double, bool> Teacher::Evaluate()
{
	return m_catalog.EvaluateTeacherCatalog(*this);
}

const std::vector<std::pair<int, int>>& Teacher::GetInappropriateDates() const
{
	return m_vInappropriateDates;
}