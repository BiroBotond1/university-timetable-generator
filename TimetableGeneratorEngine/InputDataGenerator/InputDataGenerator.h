#pragma once
#include "Subject.h"
#include "Class.h"
#include "Teacher.h"
#include "ClassHour.h"

#define CLASS_NUMBER 12
#define CLASSHOUR_NUMBER_PER_WEEK 34
#define LOCATION_CLASSHOUR_NUMBER_PER_WEEK 30
#define TEACHER_CLASSHOUR_NUMBER_PER_WEEK 26

class InputDataGenerator 
{
public: 
	void Run();

private:
	Subject GetUnusedSubject(const std::unordered_set<std::string>& usedSubjects, const std::vector<Subject>& p_subjects);
	bool SubjectHasLocation(std::string subject);
	std::unordered_map<std::string, int> SetInitialSubjectLocationNumbers();
	std::unordered_map<std::string, int> SetInitialSubjectTeacherNumbers();
	void WriteCatalog(std::vector<Class> p_classes, std::vector<Subject> subjects, std::vector<Location> p_locations, std::vector<Teacher> p_teachers, std::vector<ClassHour> classHours);

private:
	std::vector<std::string> m_allSubjects = { "Matematika", "Roman", "Magyar", "Angol", "Nemet", "Kemia", "Fizika", "Torna", "Rajz", "Foldrajz", "Tortenelem",
	"Informatika", "Biologia", "Technologia", "Latin", "Francia", "Vallas", "Szobraszat", "Festeszet", "Uszas" };

	std::unordered_map<std::string, bool> m_subjectsHasLocation =
	{
		  {"Matematika", false}, {"Roman", false}, {"Magyar", false}, {"Angol", false}, {"Nemet", false},
		  {"Kemia", true}, {"Fizika", true}, {"Torna", true}, {"Rajz", true}, {"Foldrajz", false},
		  {"Tortenelem", false}, {"Informatika", true}, {"Biologia", false}, {"Technologia", false},
		  {"Latin", false}, {"Francia", false}, {"Vallas", false}, {"Szobraszat", true}, {"Festeszet", true},
		  {"Uszas", false}
	};
};