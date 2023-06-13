#pragma once

#include <fstream>
#include <algorithm>
#include "Global.h"
#include "HelperFunctions.h"
#include <chrono>

using json = nlohmann::json;


class TimetableGenerator
{
	bool m_bActive;
	double m_fitnessClass;
	double m_fitnessTeacher;
	double m_fitnessLocation;
	double m_elapsedTime;
protected:
	double Fitness(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	std::tuple<double, double, double, bool> Evaluate(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	double Fitness();
	bool ChangeLocations(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations, std::string p_strLocationID, ClassHour p_classHour, int p_nDay, int p_nHour);
	void SwapLocations(std::unordered_map<std::string, Location>& p_locations, Class& p_class, int day1, int hour1, int day2, int hour2);
	void SwapTeachers(std::unordered_map<std::string, Teacher>& p_teachers, Class& p_class, int day1, int hour1, int day2, int hour2);
	std::tuple<int, int, int, int> GetRandomFreeHourTime(std::string p_strtClassID, std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	std::string GetRandomClassID();
	void Change(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	void Changes(std::unordered_map<std::string, Class>& p_classes, std::unordered_map<std::string, Teacher>& p_teachers, std::unordered_map<std::string, Location>& p_locations);
	double LinearAnnealing(double t, int i);
public:
	void Read(std::string fileName);
	void InitCatalogs();
	void SimulatedAnnealing();
	void WriteCatalog();
};