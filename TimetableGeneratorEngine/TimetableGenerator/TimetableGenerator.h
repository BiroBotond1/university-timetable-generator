#pragma once
#include "Database.h"

class Entity;

class TimetableGenerator
{
public:
	void Run();

	void InitCatalogs();
	void SimulatedAnnealing();
	void WriteCatalog();

private:
	void Changes(Database& p_db);
	void Change(Database& p_db);
	bool ChangeLocations(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_time);
	void SwapLocations(std::shared_ptr<Class> p_class, Time p_time1, Time p_time2);
	void SwapTeachers(TeacherMap& p_teachers, std::shared_ptr<Class> p_class, Time p_time1, Time p_time2);

	double LinearAnnealing(double t, int i);

	double										Fitness();
	double										Fitness(Database& p_db);
	std::tuple<double, double, double, bool>	Evaluate(Database& p_db);

	std::tuple<Time, Time>	GetRandomFreeHourTime(std::shared_ptr<Class> p_class, TeacherMap& p_teachers, LocationMap& p_locations);

private:
	bool			m_bActive;
	double			m_fitnessClass;
	double			m_fitnessTeacher;
	double			m_fitnessLocation;
	double			m_elapsedTime;

	Database	m_DB;

	const double MAX_TEMP = 200000.0;
	const double MIN_TEMP = 2.0;
};