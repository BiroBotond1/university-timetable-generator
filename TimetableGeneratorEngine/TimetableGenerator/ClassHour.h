#pragma once
#include "Entity.h"

class Teacher;
class Class;
class Subject;

using TeacherMap = std::unordered_map<std::string, std::shared_ptr<Teacher>>;
using ClassMap = std::unordered_map<std::string, std::shared_ptr<Class>>;
using SubjectMap = std::unordered_map<std::string, std::shared_ptr<Subject>>;

#define DAY_COUNT 5
#define HOUR_COUNT 8
#define START_HOUR 8

class ClassHour : public Entity, public std::enable_shared_from_this<ClassHour>
{
public:
	ClassHour(const nlohmann::json& jsonHour, std::shared_ptr<Teacher> p_teacher, std::shared_ptr<Class> p_class, std::shared_ptr<Subject> p_subject);
	ClassHour(const ClassHour& p_classHour) : m_teacher(p_classHour.m_teacher), m_class(p_classHour.m_class), m_subject(p_classHour.m_subject), 
		m_nNumber(p_classHour.m_nNumber), m_dWeight(p_classHour.m_dWeight), Entity(p_classHour.m_id) {};

	std::shared_ptr<ClassHour> Clone(const TeacherMap& p_teachers, const ClassMap& p_classes, const SubjectMap& p_subjects) const;

	std::shared_ptr<Teacher>	GetTeacher() const	{ return m_teacher; }
	std::shared_ptr<Class>		GetClass() const	{ return m_class; }
	std::shared_ptr<Subject>	GetSubject() const	{ return m_subject; }

	double		GetWeight() const { return m_dWeight; }

	void		AddClassHoursToCatalog();
	bool		HasLocation() const;

private:
	std::shared_ptr<Teacher>	m_teacher;
	std::shared_ptr<Class>		m_class;
	std::shared_ptr<Subject>	m_subject;
	int							m_nNumber;
	double						m_dWeight;
};