#pragma once

#include "stdafx.h"
#include "HelperFunctions.h"

class DateTime {
	Day m_eDay;
	Week m_eWeek;
	int m_nHour;

public:
	DateTime(const nlohmann::json &jsonDateTime);
};