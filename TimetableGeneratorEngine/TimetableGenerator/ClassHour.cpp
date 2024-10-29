#include "stdafx.h"
#include "ClassHour.h"
#include "Random.h"
#include "Teacher.h"
#include "Location.h"
#include "Class.h"
#include "Subject.h"

ClassHour::ClassHour(const nlohmann::json& jsonHour, std::shared_ptr<Teacher> p_teacher, std::shared_ptr<Class> p_class, std::shared_ptr<Subject> p_subject)
	: m_teacher(p_teacher), m_class(p_class), m_subject(p_subject), Entity(jsonHour)	
{
	m_nNumber = jsonHour["number"];
	m_dWeight = jsonHour["weight"];
}

std::shared_ptr<ClassHour> ClassHour::Clone(const TeacherMap& p_teachers, const ClassMap& p_classes, const SubjectMap& p_subjects) const
{
	ClassHour copiedClassHour = *this;

	copiedClassHour.m_teacher = p_teachers.at(m_teacher->GetId());
	copiedClassHour.m_class = p_classes.at(m_class->GetId());
	copiedClassHour.m_subject = p_subjects.at(m_subject->GetId());

	return std::make_shared<ClassHour>(copiedClassHour);
}

bool ClassHour::HasLocation() const
{ 
	return m_subject->HasLocations();
}

void ClassHour::AddClassHoursToCatalog() 
{
	Time time;
	std::shared_ptr<Location> location;
	for (int i = 0; i < m_nNumber; i++)
	{
		do {
			time = Time{ Random::GetInt(0, DAY_COUNT - 1), Random::GetInt(0, HOUR_COUNT - 1)};
			if (HasLocation())
				location = m_subject->GetRandomLocation();
		} while (!m_class->IsFreeDay(time) || !m_teacher->IsFreeDay(time)
			|| (HasLocation() && !location->IsFreeDay(time)));

		if (HasLocation())
		{
			location->Add(time, shared_from_this());
			m_class->SetClassHour(shared_from_this(), location, time);
			m_teacher->SetClassHour(shared_from_this(), location, time);
			continue;
		} 

		m_class->Add(time, shared_from_this());
		m_teacher->Add(time, shared_from_this());
	}
} 