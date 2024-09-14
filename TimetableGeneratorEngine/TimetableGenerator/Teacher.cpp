#include "stdafx.h"
#include "Teacher.h"
#include "Global.h"

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_strID = jsonTeacher["_id"].get<std::string>();
	m_catalog = Catalog();
	m_strName = jsonTeacher["name"].get<std::string>();
	int nDay = 0, nHour;
	for (const auto& hours : jsonTeacher["inappropriateDates"])
	{
		nHour = 0;
		for(auto valid : hours)
		{
			if(valid == -1)
				m_vInappropriateDates.push_back(std::make_pair(nDay, nHour));
			nHour++;
		}	
		nDay++;
	}
}

const std::vector<std::pair<int, int>>& Teacher::GetInappropriateDates() {
	return m_vInappropriateDates;
}