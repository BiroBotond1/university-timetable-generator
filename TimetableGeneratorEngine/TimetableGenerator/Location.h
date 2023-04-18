#pragma once

#include "stdafx.h"
#include "LocationCatalog.h"

class Location {
	std::string							m_strID;
	std::string							m_strName;
	LocationCatalog						m_catalog;
	std::vector<std::pair<int, int>>	m_vReservedDates;
public:
	Location();
	Location(const nlohmann::json& jsonLocation);
	bool IsFreeDay(int p_nDay, int p_nHour);
	void	Add(int p_nDay, int p_nHour, std::string p_strSubCourseID);
	double GetFitnessValue();
	std::vector<std::pair<int, int>>	GetReservedDates();
	LocationCatalog			GetCatalog();
	void					Change(int p_nDay1, int p_nHour1, int p_nDay2, int p_nHour2);
	void					DeleteClassHour(int p_nDay, int p_nHour);
	void					SetClassHour(std::string p_strClassHourID, std::string p_strLocationID, int p_nDay, int p_nHour);
};