#pragma once
#include "Subject.h"
#include "Class.h"
#include "Teacher.h"
#include "ClassHour.h"

class InputDataGenerator 
{

	struct SubjectData
	{	
		bool IsUsed = false;				// Whether the subject has been added to the container
		int ClassHoursCount = 0;			// Total class hours assigned to this subject
	};

	struct SubjectLocationData : SubjectData
	{
		int LocationCount = 0;				//Count how many locations we are using with a subject
		std::vector<Location> Locations;	//Contains the locations that we are using with the subject
	};

	struct SubjectTeacherData : SubjectData
	{
		int TeacherCount = 1;				//Count how many teacher we are using with a subject
		std::vector<Teacher> Teachers;		//Contains the teachers that we are using with the subject
	};

public: 
	void Run();

private:

	std::vector<Subject> InitializeSubjects();

	void SetInitialSubjectLocationNumbers(std::unordered_map<SubjectType, SubjectTeacherData>& p_subjectTeacherDataMap);

	void CreateClass(std::vector<Class>& classes, int i);

	Subject GetUnusedSubject(const std::unordered_set<SubjectType>& usedSubjects, const std::vector<Subject>& p_subjects);

	void AddLocationsFromSubject(const Subject& p_subject, std::vector<Location>& p_locations, SubjectLocationData& p_subjectLocationData, int p_subjectClassHourNumber);

	void AddTeachersFromSubject(const Subject& p_subject, std::vector<Teacher>& p_teachers, SubjectTeacherData& p_subjectTeacherData, int p_subjectClassHourNumber);
	
	void WriteCatalog(const std::vector<Class>& p_classes, const std::vector<Subject>& p_subjects, const std::vector<Location>& p_locations, const std::vector<Teacher>& p_teachers, const std::vector<ClassHour>& p_classHours);

	template<typename T>
	std::vector<json> GetEntitiesAsJson(const std::vector<T>& entity);
};