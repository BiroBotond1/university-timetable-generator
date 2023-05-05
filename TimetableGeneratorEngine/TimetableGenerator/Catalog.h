#pragma once
#include "stdafx.h"
#include "HelperFunctions.h"
#include "ClassHour.h"

class Catalog
{
protected:
	bool m_bChanged;
	double m_dFitness;
	std::vector<std::vector<std::string>> m_catalog;
	std::vector<std::vector<std::string>> m_locations;

	const double		GetEvenDaysFitness(const std::vector<int>& coursesNumber);
	const double		GetNoHoleHoursFitness(bool& p_bHasEmptyHours);
	const double		GetInactiveDaysFitness(const int p_nDay, const int p_nHour, const std::vector<std::pair<int, int>>& p_inactiveDays);
public:
	Catalog();
	Catalog(const Catalog& rhsCatalog);
	const bool			IsFreeDay(const int p_nDay, const int p_nHour);
	void				Add(const int p_nDay, const int p_nHour, const std::string p_strSubCourseID);
	void				Swap(const int p_nDay1, const int p_nHour1, const int p_nDay2, const int p_nHour2);
	const virtual double GetFitnessValue() = 0;
	const std::string	GetClassHourID(const int p_nDay, const int p_nHour);
	void				SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, const int p_nDay, const int p_nHour);
	void				DeleteClassHour(const int p_nDay, const int p_nHour);
	const std::string	GetLocationID(const int p_nDay, const int p_nHour);
	void				SetLocationID(const std::string p_strLocationID, const int p_nDay, const int p_nHour);
	const nlohmann::json GetJSONObj();
};