#include "stdafx.h"
#include "Subject.h"
#include "Random.h"

Subject::Subject(const nlohmann::json& jsonSubject) {
	m_strID = jsonSubject["_id"].get<std::string>();
	m_strName = jsonSubject["name"].get<std::string>();
	for (auto location : jsonSubject["locations"]) {
		m_locationIDs.push_back(location["_id"].get<std::string>());
	}
}

const std::string Subject::GetRandomLocationID() {
	return m_locationIDs[Random::GetInt(0, int(m_locationIDs.size() - 1))];
}
