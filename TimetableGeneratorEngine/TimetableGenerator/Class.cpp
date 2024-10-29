#include "stdafx.h"
#include "Class.h"
#include "Teacher.h"
#include "Location.h"

Class::Class(const nlohmann::json& jsonClass, const TimetableConfig& p_config) : EntityWithCatalog(jsonClass, p_config) {}

std::shared_ptr<Class> Class::Clone() const
{
	return std::make_shared<Class>(*this);
}

std::shared_ptr<Teacher> Class::GetTeacher(Time p_time)
{
	if (m_catalog.IsFreeDay(p_time))
		return nullptr;
	
	return m_catalog.GetClassHour(p_time)->GetTeacher();
}