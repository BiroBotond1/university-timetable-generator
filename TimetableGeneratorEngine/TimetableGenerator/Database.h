#pragma once

class Teacher;
class Location;
class Class;
class Subject;
class ClassHour;

using TeacherMap = std::unordered_map<std::string, std::shared_ptr<Teacher>>;
using LocationMap = std::unordered_map<std::string, std::shared_ptr<Location>>;
using ClassMap = std::unordered_map<std::string, std::shared_ptr<Class>>;
using SubjectMap = std::unordered_map<std::string, std::shared_ptr<Subject>>;
using ClassHourMap = std::unordered_map<std::string, std::shared_ptr<ClassHour>>;

using json = nlohmann::json;

class Database
{
public:
	void Fill(const std::string& p_fileName);

	void DeepCopy(Database& p_copyDB);

	json WriteCatalog();
	
	TeacherMap&		GetTeachers()	{ return m_teachers; }
	LocationMap&	GetLocations()	{ return m_locations; }
	ClassMap&		GetClasses()	{ return m_classes; }
	SubjectMap&		GetSubjects()	{ return m_subjects; }
	ClassHourMap&	GetClassHours() { return m_classHours; }

	std::shared_ptr<Class> GetRandomClass();

private:
	template <typename T>
	std::unordered_map<std::string, std::shared_ptr<T>> DeepCopyMap(const std::unordered_map<std::string, std::shared_ptr<T>>& originalMap);

	SubjectMap DeepCopySubjects(const Database& p_copyDB);
	ClassHourMap DeepCopyClassHours(const Database& p_copyDB);

	void ChangeCatalogPointers(const Database& p_copyDB);

	bool IsEmpty();

private:
	TeacherMap					m_teachers;
	LocationMap					m_locations;
	ClassMap					m_classes;
	SubjectMap					m_subjects;
	ClassHourMap				m_classHours;
	std::vector<std::string>	m_classIDs;
};

