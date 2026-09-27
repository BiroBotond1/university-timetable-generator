#pragma once
#include "Database.h"
#include <atomic>

class Entity;

class TimetableGenerator
{
public:
	std::string Run(const std::string& input);
	//throws GenerationCancelled once p_cancelled is set; it is checked before every placement
	//attempt and every annealing iteration, so a run stops within one iteration
	std::string Run(const std::string& input, const std::atomic<bool>& p_cancelled);

private:
	void CheckWeeklyHours();
	void InitCatalogs(const std::string& p_input, const std::atomic<bool>& p_cancelled);
	std::shared_ptr<ClassHour> PlaceClassHours();
	void SimulatedAnnealing(const std::atomic<bool>& p_cancelled);
	std::string WriteCatalog();

	bool Changes(Database& p_db);
	bool Change(Database& p_db);
	bool ChangeLocations(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_time);
	void SwapLocations(std::shared_ptr<Class> p_class, Time p_time1, Time p_time2);
	void SwapTeachers(std::shared_ptr<Class> p_class, Time p_time1, Time p_time2);

	void InitLinearAnnealingParameter();
	double LinearAnnealing(double t, int i);

	double										Fitness();
	double										Fitness(Database& p_db);
	std::tuple<double, double, double, bool>	Evaluate(Database& p_db);

	std::optional<std::tuple<Time, Time>>	GetRandomFreeHourTime(std::shared_ptr<Class> p_class);

private:
	bool			m_bActive = false;
	double			m_fitnessClass = 0;
	double			m_fitnessTeacher = 0;
	double			m_fitnessLocation = 0;
	double			m_elapsedTime = 0;

	double			m_linearAnnealing = 0.1;

	Database	m_DB;

	const double MAX_TEMP = 100000.0;
	const double MIN_TEMP = 2.0;
	const int INIT_ATTEMPTS = 20;
};