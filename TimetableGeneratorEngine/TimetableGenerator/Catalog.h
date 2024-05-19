#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"

class Catalog
{
protected:
	bool m_bChanged;
	bool m_bActive;
	double m_dFitness;
	std::vector<std::vector<std::string>> m_catalog;
	std::vector<std::vector<std::string>> m_locations;

	double		GetEvenDaysFitness(const std::vector<int>& coursesNumber);
	double		GetNoHoleHoursFitness(bool& p_bHasEmptyHours, bool bStrongConstraint);
	double		GetInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays);
	void		AddCourseNumberOnADay(const std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double		GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
public:
	Catalog();
	//Catalog(const Catalog& rhsCatalog);
	const bool			IsFreeDay(Time p_time);
	void				Add(Time p_Time, const std::string p_strSubCourseID);
	void				Swap(Time p_time1, Time p_time2);
	std::tuple<double, bool>	EvaluateClassCatalog();
	std::tuple<double, bool>	EvaluateTeacherCatalog(std::string p_strTeacherID);
	std::tuple<double, bool>	EvaluateLocationCatalog(std::string p_strLocationID);
	const std::string	GetClassHourID(Time p_time);
	void				SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, Time p_Time);
	void				DeleteClassHour(Time p_time);
	const std::string	GetLocationID(Time p_time);
	void				SetLocationID(const std::string p_strLocationID, const Time p_time);
	void				SetChange(bool p_bChanged) { m_bChanged = p_bChanged; }
	const nlohmann::json GetJSONObj();
};