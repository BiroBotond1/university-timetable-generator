#include "stdafx.h"
#include "Catalog.h"
#include "Class.h"
#include "Subject.h"
#include "Teacher.h"
#include "Location.h"
#include "ClassHour.h"

Catalog::Catalog(const TimetableConfig& p_conf) : m_bChanged(true), m_dFitness(0), m_conf(p_conf)
{
	m_catalog = std::vector<std::vector<std::shared_ptr<ClassHour>>>(DAY_COUNT, std::vector<std::shared_ptr<ClassHour>>(HOUR_COUNT, nullptr));
	m_locations = std::vector<std::vector<std::shared_ptr<Location>>>(DAY_COUNT, std::vector<std::shared_ptr<Location>>(HOUR_COUNT, nullptr));
}

std::tuple<double, bool> Catalog::EvaluateClassCatalog() 
{
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	std::vector<int> vCourseNumbers(m_catalog.size(), 0);
	m_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++)
	{
		std::unordered_map<std::string, int> mCourseNumberOnADay;
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++)
		{
			if (IsFreeDay(Time{ nDay, nHour }))
			{
				hasEmptyHours = true;
				continue;
			}

			auto classHour = GetClassHour(Time{ nDay, nHour });

			vCourseNumbers[nDay]++;

			if (m_conf.classCatalogOneTypeOfCourseOnADay)
				AddCourseNumberOnADay(classHour, mCourseNumberOnADay);

			CalcNoHoleHoursFitness(m_conf.classCatalogNoHoleHour, hasEmptyHours, true);

			//the courses starts at 8
			if (m_conf.classCatalogCoursesStartsAtEight)
			{
				if (m_conf.classCatalogCoursesWeight)
					m_dFitness += std::abs(nDay - 8) * classHour->GetWeight();
				else
					m_dFitness += std::abs(nDay - 8);
			}
		}

		CalcFitnessOneTypeOfCourseOnADay(m_conf.classCatalogOneTypeOfCourseOnADay, mCourseNumberOnADay);
	}

	CalcEvenDaysFitness(m_conf.classCatalogEvenHours,vCourseNumbers);

	EnsureCorrectCatalog();

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

std::tuple<double, bool> Catalog::EvaluateTeacherCatalog(const Teacher& teacher)
{
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	m_bActive = true;
	std::vector<int> coursesNumbers(m_catalog.size(), 0);

	for (int nDay = 0; nDay < m_catalog.size(); nDay++)
	{
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) 
		{
			if (IsFreeDay(Time{ nDay, nHour })) 
			{
				hasEmptyHours = true;
				continue;
			}

			coursesNumbers[nDay]++;

			CalcInactiveDaysFitness(Time{ nDay, nHour }, teacher.GetInappropriateDates());

			CalcNoHoleHoursFitness(m_conf.teacherCatalogNoHoleHour, hasEmptyHours, false);
		}
	}

	CalcEvenDaysFitness(m_conf.teacherCatalogEvenHours, coursesNumbers);

	EnsureCorrectCatalog();

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

std::tuple<double, bool> Catalog::EvaluateLocationCatalog(const Location& location)
{
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	m_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++)
	{
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) 
		{
			if (IsFreeDay(Time{ nDay, nHour }))
			{
				continue;
			}

			CalcInactiveDaysFitness(Time{ nDay, nHour }, location.GetReservedDates());
		}
	}

	EnsureCorrectCatalog();

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

void Catalog::AddCourseNumberOnADay(std::shared_ptr<ClassHour> p_classHour, std::unordered_map<std::string, int>& p_mCourseNumberOnADay)
{
	if (p_mCourseNumberOnADay.find(p_classHour->GetId()) != p_mCourseNumberOnADay.end())
		p_mCourseNumberOnADay[p_classHour->GetId()]++;
	else
		p_mCourseNumberOnADay[p_classHour->GetId()] = 1;
}

void Catalog::CalcFitnessOneTypeOfCourseOnADay(bool p_bIsSet, std::unordered_map<std::string, int>& p_mCourseNumberOnADay)
{
	if (p_bIsSet)
		m_dFitness += GetFitnessOneTypeOfCourseOnADay(p_mCourseNumberOnADay);
}

//just 1 type of course on each day
double Catalog::GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay) 
{
	double dFitness = 0;
	for (auto& courseNumber : p_mCourseNumberOnADay) 
	{
		if (courseNumber.second > 1)
		{
			dFitness -= (double)courseNumber.second * 2;
			m_bActive = false;
		}
		courseNumber.second = 0;
	}
	return dFitness;
}

bool Catalog::IsFreeDay(Time p_time) 
{
	return m_catalog[p_time.GetDay()][p_time.GetHour()] == nullptr;
}

void Catalog::Add(Time p_time, std::shared_ptr<ClassHour> p_classHour) 
{
	m_catalog[p_time.GetDay()][p_time.GetHour()] = p_classHour;
}

void Catalog::Swap(Time p_time1, Time p_time2)
{
	m_bChanged = true;
	auto classHour = m_catalog[p_time1.GetDay()][p_time1.GetHour()];
	m_catalog[p_time1.GetDay()][p_time1.GetHour()] = m_catalog[p_time2.GetDay()][p_time2.GetHour()];
	m_catalog[p_time2.GetDay()][p_time2.GetHour()] = classHour;

	auto location = m_locations[p_time1.GetDay()][p_time1.GetHour()];
	m_locations[p_time1.GetDay()][p_time1.GetHour()] = m_locations[p_time2.GetDay()][p_time2.GetHour()];
	m_locations[p_time2.GetDay()][p_time2.GetHour()] = location;
}

std::shared_ptr<ClassHour> Catalog::GetClassHour(const Time& p_time)
{
	return m_catalog[p_time.GetDay()][p_time.GetHour()];
}

void Catalog::SetClassHour(std::shared_ptr<ClassHour> p_classHour, std::shared_ptr<Location> p_location, Time p_time)
{
	m_bChanged = true;
	m_catalog[p_time.GetDay()][p_time.GetHour()] = p_classHour;
	m_locations[p_time.GetDay()][p_time.GetHour()] = p_location;
}

void Catalog::DeleteClassHour(Time p_time) 
{
	m_catalog[p_time.GetDay()][p_time.GetHour()] = nullptr;
	m_locations[p_time.GetDay()][p_time.GetHour()] = nullptr;
}

std::shared_ptr<Location> Catalog::GetLocation(Time p_time)
{
	return m_locations[p_time.GetDay()][p_time.GetHour()];
}

void Catalog::SetLocation(std::shared_ptr<Location> p_Location, Time p_time)
{
	m_locations[p_time.GetDay()][p_time.GetHour()] = p_Location;
}

const nlohmann::json Catalog::GetJSONObj()
{
	nlohmann::json json;
	for (int nDay = 0; nDay < m_catalog.size(); nDay++)
	{
		nlohmann::json array;
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++)
		{
			nlohmann::json jsonClassHour;
			auto classHour = GetClassHour(Time{ nDay, nHour });
			const auto& location = GetLocation(Time{ nDay, nHour });
			jsonClassHour["classID"] = classHour ? classHour->GetClass()->GetId() : "";
			jsonClassHour["subjectID"] = classHour ? classHour->GetSubject()->GetId() : "";
			jsonClassHour["teacherID"] = classHour ? classHour->GetTeacher()->GetId() : "";
			jsonClassHour["locationID"] = location ? location->GetId() : "";
			array.push_back(jsonClassHour);
		}
		json.push_back(array);
	}
	return json;
}

void Catalog::CalcEvenDaysFitness(bool p_IsSet, const std::vector<int>& p_coursesNumber)
{
	if(p_IsSet)
		m_dFitness += GetEvenDaysFitness(p_coursesNumber);
}

//even hours
double Catalog::GetEvenDaysFitness(const std::vector<int>& p_coursesNumber)
{
	double dFitness = 0;
	for (int i = 0; i < p_coursesNumber.size(); i++) 
	{
		for (int j = 0; j < p_coursesNumber.size(); j++) 
		{
			dFitness -= pow(abs(p_coursesNumber[i] - p_coursesNumber[j]), 2);
		}
	}
	return dFitness;
}

void Catalog::CalcNoHoleHoursFitness(bool p_IsSet, bool p_bHasEmptyHours, bool bStrongConstraint)
{
	if (p_IsSet)
		m_dFitness += GetNoHoleHoursFitness(p_bHasEmptyHours, bStrongConstraint);
}

//no empty hours between courses
double Catalog::GetNoHoleHoursFitness(bool p_bHasEmptyHours, bool bStrongConstraint)
{
	if (!p_bHasEmptyHours)
		return 0;

	p_bHasEmptyHours = false;
	if(bStrongConstraint)
		m_bActive = false;

	return -4;
}

void Catalog::CalcInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays)
{
	m_dFitness += GetInactiveDaysFitness(p_time, p_inactiveDays);
}

//can t put days on ineligible days
double Catalog::GetInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays) 
{
	auto date = std::make_pair(p_time.GetDay(), p_time.GetHour());
	if (std::find(p_inactiveDays.begin(), p_inactiveDays.end(), date) != p_inactiveDays.end())
	{
		m_bActive = false;
		return -10;
	}
	return 0;
}

void Catalog::ChangePointers(const ClassHourMap& p_classHours, const LocationMap& p_locations)
{
	for (auto& classHoursOnADay : m_catalog)
	{
		for (auto& classHour : classHoursOnADay)
		{
			classHour = classHour ? p_classHours.at(classHour->GetId()) : nullptr;
		}
	}

	for (auto& locationsOnADay : m_locations)
	{
		for (auto& location : locationsOnADay)
		{
			location = location ? p_locations.at(location->GetId()) : nullptr;
		}
	}
}

void Catalog::EnsureCorrectCatalog()
{
	if (m_bActive)
	{
		m_dFitness += 1000;
	}
}