#include "Group.h"

Group::Group(const nlohmann::json & jsonGroup) {
	m_strName = jsonGroup["name"].get<std::string>();
	for (auto jsonInvalidGroupID : jsonGroup["invalidGroups"]) {
		m_vInvalidGroupIDs.push_back(jsonInvalidGroupID["id"]);
	}
}

std::vector<int> Group::GetInvalidGroupIDs() {
	return m_vInvalidGroupIDs;
}

bool Group::IsValidityWithGroup(int p_nGroupID) {
	return std::find(m_vInvalidGroupIDs.begin(), m_vInvalidGroupIDs.end(), p_nGroupID) == m_vInvalidGroupIDs.end();
}

std::string Group::GetName() {
	return m_strName;
}
