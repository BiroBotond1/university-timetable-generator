#include "Class.h"
#include "global.h"

Class::Class(const nlohmann::json& jsonClass) {
	m_strID = jsonClass["_id"].get<std::string>();
	m_strName = jsonClass["name"].get<std::string>();
	m_catalog = Catalog();
}

const std::string Class::GetClassHourID(Time p_time) {
	return m_catalog.GetClassHourID(p_time);
}

const std::string Class::GetTeacherID(Time p_time) {
	if (m_catalog.IsFreeDay(p_time))
		return "";
	return g_classHours[m_catalog.GetClassHourID(p_time)].GetTeacherID();
}

const std::string Class::GetLocationID(Time p_time) {
	if (m_catalog.IsFreeDay(p_time))
		return "";
	return m_catalog.GetLocationID(p_time);
}