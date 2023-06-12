#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"
#include "ClassHour.h"

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
	double		GetInactiveDaysFitness(const int p_nDay, const int p_nHour, const std::vector<std::pair<int, int>>& p_inactiveDays);
	void		AddCourseNumberOnADay(const std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
	double		GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay);
public:
	Catalog();
	//Catalog(const Catalog& rhsCatalog);
	const bool			IsFreeDay(const int p_nDay, const int p_nHour);
	void				Add(const int p_nDay, const int p_nHour, const std::string p_strSubCourseID);
	void				Swap(const int p_nDay1, const int p_nHour1, const int p_nDay2, const int p_nHour2);
	std::tuple<double, bool>	EvaluateClassCatalog();
	std::tuple<double, bool>	EvaluateTeacherCatalog(std::string p_strTeacherID);
	std::tuple<double, bool>	EvaluateLocationCatalog(std::string p_strLocationID);
	const std::string	GetClassHourID(const int p_nDay, const int p_nHour);
	void				SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, const int p_nDay, const int p_nHour);
	void				DeleteClassHour(const int p_nDay, const int p_nHour);
	const std::string	GetLocationID(const int p_nDay, const int p_nHour);
	void				SetLocationID(const std::string p_strLocationID, const int p_nDay, const int p_nHour);
	void				SetChange(bool p_bChanged) { m_bChanged = p_bChanged; }
	const nlohmann::json GetJSONObj();
};