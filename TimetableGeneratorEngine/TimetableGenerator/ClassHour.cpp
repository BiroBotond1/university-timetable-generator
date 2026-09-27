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

//false when an hour found no free slot; the hours placed before it stay in the catalogs
bool ClassHour::AddClassHoursToCatalog()
{
	for (int i = 0; i < m_nNumber; i++)
	{
		auto freeSlot = GetRandomFreeSlot();
		if (!freeSlot)
			return false;

		auto [time, location] = *freeSlot;
		if (location)
		{
			location->Add(time, shared_from_this());
			m_class.lock()->SetClassHour(shared_from_this(), location, time);
			m_teacher.lock()->SetClassHour(shared_from_this(), location, time);
		}
		else {
			m_class.lock()->Add(time, shared_from_this());
			m_teacher.lock()->Add(time, shared_from_this());
		}
	}
	return true;
}

//lists every free (time, location) pair instead of drawing random ones until one fits, so an
//empty list proves there is no slot; picking from the list is as uniform as the random draws were
std::optional<std::pair<Time, std::shared_ptr<Location>>> ClassHour::GetRandomFreeSlot() const
{
	auto clas = m_class.lock();
	auto teacher = m_teacher.lock();
	auto subject = m_subject.lock();

	std::vector<std::pair<Time, std::shared_ptr<Location>>> vFreeSlots;
	for (int nDay = 0; nDay < DAY_COUNT; nDay++)
	{
		for (int nHour = 0; nHour < HOUR_COUNT; nHour++)
		{
			Time time{ nDay, nHour };
			if (!clas->IsFreeDay(time) || !teacher->IsFreeDay(time))
				continue;

			if (!subject->HasLocations())
			{
				vFreeSlots.emplace_back(time, nullptr);
				continue;
			}

			for (const auto& location : subject->GetLocations())
			{
				auto sharedLocation = location.lock();
				if (sharedLocation->IsFreeDay(time))
					vFreeSlots.emplace_back(time, sharedLocation);
			}
		}
	}

	if (vFreeSlots.empty())
		return std::nullopt;

	return vFreeSlots[Random::GetInt(0, int(vFreeSlots.size() - 1))];
}