#pragma once

#include <fstream>
#include <algorithm>
#include "Global.h"
#include "HelperFunctions.h"
#include <chrono>

using json = nlohmann::json;


class TimetableGenerator
{
protected:
	double Fitness(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	double Fitness();
	void ChangeClass(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, Class& p_clas, std::string classHourID, int day, int hour);
	void ChangeTeacher(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, Class& p_class, std::string classHourID, int day, int hour);
	bool ChangeLocations(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, std::string p_strLocationID, ClassHour p_classHour, int p_nDay, int p_nHour);
	void SwapLocations(std::unordered_map<std::string, Location>& p_locations, Class& p_class, int day1, int hour1, int day2, int hour2);
	void SwapTeachers(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, Class& p_class, int day1, int hour1, int day2, int hour2);
	std::string GetRandomClassID();
	void Change(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	void Changes(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	double LinearAnnealing(int i);
public:
	void Read(std::string fileName);
	void InitCatalogs();
	void SimulatedAnnealing();
	void WriteCatalog();
};