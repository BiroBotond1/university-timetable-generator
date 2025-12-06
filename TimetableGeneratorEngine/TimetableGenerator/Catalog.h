#pragma once
#include "TimetableConfig.h"
#include "ClassHour.h"

class EntityWithCatalog;
class Location;

using ClassHourMap = std::unordered_map<std::string, std::shared_ptr<ClassHour>>;
using LocationMap = std::unordered_map<std::string, std::shared_ptr<Location>>;

enum class CatalogType {
	Class,
	Teacher,
	Location
};

class Catalog
{
public:
	Catalog(const TimetableConfig& p_conf);

	bool				IsFreeDay(Time p_time);
	void				Add(Time p_Time, std::shared_ptr<ClassHour> p_classHour);
	void				Swap(Time p_time1, Time p_time2);

	std::tuple<double, bool>	EvaluateClassCatalog();
	std::tuple<double, bool>	EvaluateTeacherCatalog(const Teacher& teacher);
	std::tuple<double, bool>	EvaluateLocationCatalog(const Location& location);

	std::shared_ptr<ClassHour>	GetClassHour(const Time& p_time);
	void						SetClassHour(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_Time);
	void						DeleteClassHour(Time p_time);

	std::shared_ptr<Location>	GetLocation(Time p_time);
	void						SetLocation(std::shared_ptr<Location> p_Location, const Time p_time);

	void				SetChange(bool p_bChanged) { m_bChanged = p_bChanged; }

	const nlohmann::json GetJSONObj(CatalogType p_catalogType);

	void				ChangePointers(const ClassHourMap& p_classHours, const LocationMap& p_locations);

protected:
	void		CalcEvenDaysFitness(bool p_IsSet, const std::vector<int>& coursesNumber);
	double		GetEvenDaysFitness(const std::vector<int>& coursesNumber);

	void		CalcNoHoleHoursFitness(bool p_IsSet, bool p_bHasEmptyHours, bool bStrongConstraint);
	double		GetNoHoleHoursFitness(bool p_bHasEmptyHours, bool bStrongConstraint);

	void		CalcInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays);
	double		GetInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays);

	void		CalcFitnessOneTypeOfCourseOnADay(bool p_IsSet, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double		GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);

	void		AddCourseNumberOnADay(std::shared_ptr<ClassHour> p_classHour, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);

	void		EnsureCorrectCatalog();

protected:
	bool	m_bChanged;
	bool	m_bActive;
	double	m_dFitness;

	std::vector<std::vector<std::shared_ptr<ClassHour>>>	m_catalog;
	std::vector<std::vector<std::optional<std::weak_ptr<Location>>>> m_locations;

	TimetableConfig m_conf;
};