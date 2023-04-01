#include "Subject.h"
#include "HelperFunctions.h"

Subject::Subject(const nlohmann::json& jsonSubject) {
	m_nID = jsonSubject["id"];
	m_strName = jsonSubject["name"].get<std::string>();
	if (jsonSubject.contains("locationIDs")) {
		for (auto locationID : jsonSubject["locationIDs"]) {
			m_locationIDs.push_back(locationID);
		}
	}
}

std::string Subject::GetName() {
	return m_strName;
}

std::string	Subject::ToString() {
	return m_strName;
}

bool Subject::HasLocations() {
	return !m_locationIDs.empty();
}

int Subject::GetRandomLocationID() {
	return RandInt(0, int(m_locationIDs.size() - 1));
}
