#include "Subject.h"
#include "HelperFunctions.h"

Subject::Subject() {}

Subject::Subject(const nlohmann::json& jsonSubject) {
	m_strID = jsonSubject["_id"].get<std::string>();
	m_strName = jsonSubject["name"].get<std::string>();
	for (auto location : jsonSubject["locations"]) {
		m_locationIDs.push_back(location["_id"].get<std::string>());
	}
}

bool Subject::HasLocations() {
	return !m_locationIDs.empty();
}

std::string Subject::GetRandomLocationID() {
	return m_locationIDs[RandInt(0, int(m_locationIDs.size() - 1))];
}
