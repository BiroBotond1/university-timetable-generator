#pragma once

#include "stdafx.h"
#include "LocationCatalog.h"

class Location {
	int									m_nID;
	std::string							m_strName;
	LocationCatalog						m_catalog;
	std::vector<std::pair<int, int>>	m_reservedDates;
	std::vector<std::pair<int, int>>	m_fixedDates;
public:
	Location();
	Location(const nlohmann::json& jsonLocation);
	LocationCatalog			GetCatalog();
	std::string				GetName();
	bool					IsFreeDay(int day, int hour);
	void					Add(int day, int hour, int subCourseID);
	void					Change(int day1, int hour1, int day2, int hour2);
	int						GetClassHourID(int day1, int hour1);
	void					SetClassHourID(int day, int hour, int classHour);
	std::vector<std::pair<int, int>> GetReservedDates();
};