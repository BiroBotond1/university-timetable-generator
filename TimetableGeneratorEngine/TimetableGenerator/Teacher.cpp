#include "Teacher.h"
#include "Global.h"

Teacher::Teacher(const nlohmann::json &jsonTeacher) {
	m_strID = jsonTeacher["_id"].get<std::string>();
	m_catalog = std::make_unique<TeacherCatalog>(m_strID);
	m_strName = jsonTeacher["name"].get<std::string>();
	int nDay = 0, nHour;
	for (auto hours : jsonTeacher["inappropriateDates"])
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

Teacher::Teacher(const Teacher& rhsTeacher) {
	m_strID = rhsTeacher.m_strID;
	m_strName = rhsTeacher.m_strName;
	m_vInappropriateDates = rhsTeacher.m_vInappropriateDates;
	m_catalog = std::make_unique<TeacherCatalog>(*rhsTeacher.m_catalog, m_strID);
}

void Teacher::operator=(const Teacher& rhsTeacher) {
	m_strID = rhsTeacher.m_strID;
	m_strName = rhsTeacher.m_strName;
	m_vInappropriateDates = rhsTeacher.m_vInappropriateDates;
	m_catalog = std::make_unique<TeacherCatalog>(*rhsTeacher.m_catalog, m_strID);
}