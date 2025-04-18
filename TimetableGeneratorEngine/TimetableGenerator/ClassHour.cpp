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
	auto copiedClassHour = std::make_shared<ClassHour>(*this);

	copiedClassHour->ChangePointers(p_teachers, p_classes, p_subjects);

	return copiedClassHour;
}

void ClassHour::ChangePointers(const TeacherMap& p_teachers, const ClassMap& p_classes, const SubjectMap& p_subjects)
{
	m_teacher = p_teachers.at(m_teacher.lock()->GetId());
	m_class = p_classes.at(m_class.lock()->GetId());
	m_subject = p_subjects.at(m_subject.lock()->GetId());
}

bool ClassHour::HasLocation() const
{ 
	return m_subject.lock()->HasLocations();
}

void ClassHour::AddClassHoursToCatalog() 
{
	for (int i = 0; i < m_nNumber; i++)
	{
		if (HasLocation()) 
		{
			auto [time, location] = GetFreeTimeWithLocation();
			
			location->Add(time, shared_from_this());
			m_class.lock()->SetClassHour(shared_from_this(), location, time);
			m_teacher.lock()->SetClassHour(shared_from_this(), location, time);
		}
		else {
			Time freeTime = GetFreeTime();

			m_class.lock()->Add(freeTime, shared_from_this());
			m_teacher.lock()->Add(freeTime, shared_from_this());
		}
	}
}

Time ClassHour::GetFreeTime()
{
	Time time = Random::GetTime();

	while (!m_class.lock()->IsFreeDay(time) || !m_teacher.lock()->IsFreeDay(time))
	{
		time = Random::GetTime();
	}

	return time;
}

std::pair<Time, std::shared_ptr<Location>> ClassHour::GetFreeTimeWithLocation()
{
	Time time = Random::GetTime();
	std::shared_ptr<Location> location = m_subject.lock()->GetRandomLocation();

	while (!m_class.lock()->IsFreeDay(time) || !m_teacher.lock()->IsFreeDay(time) || !location->IsFreeDay(time))
	{
		time = Random::GetTime();
		location = m_subject.lock()->GetRandomLocation();
	}

	return std::make_pair(time, location);
}