#include "stdafx.h"
#include "Catalog.h"
#include "Global.h"

Catalog::Catalog() {
	m_bChanged = true;
	m_dFitness = 0;
	m_catalog = std::vector<std::vector<std::string>>(DAY_COUNT, std::vector<std::string>(HOUR_COUNT, ""));
	m_locations = std::vector<std::vector<std::string>>(DAY_COUNT, std::vector<std::string>(HOUR_COUNT, ""));
}

std::tuple<double, bool>	Catalog::EvaluateClassCatalog() {
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	std::vector<int> vCourseNumbers(m_catalog.size(), 0);
	m_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		std::unordered_map<std::string, int> mCourseNumberOnADay;
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(Time{ nDay, nHour })) {
				hasEmptyHours = true;
				continue;
			}

			vCourseNumbers[nDay]++;

			if (g_bClassCatalogOneTypeOfCourseOnADay)
				AddCourseNumberOnADay(m_catalog[nDay][nHour], mCourseNumberOnADay);

			if (g_bClassCatalogNoHoleHour)
				m_dFitness += GetNoHoleHoursFitness(hasEmptyHours, true);

			//the courses starts at 8
			if (g_bClassCatalogCoursesStartsAtEight) {
				if (g_bClassCatalogCoursesWeight)
					m_dFitness += std::abs(nDay - 8) * g_classHours[m_catalog[nDay][nHour]].GetWeight();
				else
					m_dFitness += std::abs(nDay - 8);
			}
		}

		if (g_bClassCatalogOneTypeOfCourseOnADay)
			m_dFitness += GetFitnessOneTypeOfCourseOnADay(mCourseNumberOnADay);
	}

	if (g_bClassCatalogEvenHours)
		m_dFitness += GetEvenDaysFitness(vCourseNumbers);

	if (m_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

std::tuple<double, bool>	Catalog::EvaluateTeacherCatalog(std::string p_strTeacherID) {
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	m_bActive = true;
	std::vector<int> coursesNumbers(m_catalog.size(), 0);

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		bool hasEmptyHours = false;

		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(Time{ nDay, nHour })) {
				hasEmptyHours = true;
				continue;
			}

			coursesNumbers[nDay]++;

			m_dFitness += GetInactiveDaysFitness(Time{ nDay, nHour }, g_teachers[p_strTeacherID].GetInappropriateDates());

			if (g_bTeacherCatalogNoHoleHour)
				m_dFitness += GetNoHoleHoursFitness(hasEmptyHours, false);
		}
	}

	if (g_bTeacherCatalogEvenHours)
		m_dFitness += GetEvenDaysFitness(coursesNumbers);

	if (m_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

std::tuple<double, bool>	Catalog::EvaluateLocationCatalog(std::string p_strLocationID) {
	if (!m_bChanged)
		return std::make_tuple(m_dFitness, m_bActive);

	m_dFitness = 0;
	m_bActive = true;

	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			if (IsFreeDay(Time{ nDay, nHour })) {
				continue;
			}

			m_dFitness += GetInactiveDaysFitness(Time{ nDay, nHour }, g_locations[p_strLocationID].GetReservedDates());
		}
	}

	//ensure if the catalog is correct don t change that
	if (m_bActive) {
		m_dFitness += 1000;
	}

	m_bChanged = false;
	return std::make_tuple(m_dFitness, m_bActive);
};

void Catalog::AddCourseNumberOnADay(const std::string strClassHourID, std::unordered_map<std::string, int>& p_mCourseNumberOnADay) {
	if (p_mCourseNumberOnADay.find(strClassHourID) != p_mCourseNumberOnADay.end())
		p_mCourseNumberOnADay[strClassHourID]++;
	else
		p_mCourseNumberOnADay[strClassHourID] = 1;
}

//just 1 type of course on each day
double Catalog::GetFitnessOneTypeOfCourseOnADay(std::unordered_map<std::string, int>& p_mCourseNumberOnADay) {
	double dFitness = 0;
	for (auto& courseNumber : p_mCourseNumberOnADay) {
		if (courseNumber.second > 1) {
			dFitness -= (courseNumber.second * 2);
			m_bActive = false;
		}
		courseNumber.second = 0;
	}
	return dFitness;
}

const bool Catalog::IsFreeDay(Time p_time) {
	return m_catalog[p_time.GetDay()][p_time.GetHour()].compare("") == 0;
}

void Catalog::Add(Time p_time, const std::string p_strSubCourseID) {
	m_catalog[p_time.GetDay()][p_time.GetHour()] = p_strSubCourseID;
}

void Catalog::Swap(Time p_time1, Time p_time2) {
	m_bChanged = true;
	std::string strClassHourID = m_catalog[p_time1.GetDay()][p_time1.GetHour()];
	m_catalog[p_time1.GetDay()][p_time1.GetHour()] = m_catalog[p_time2.GetDay()][p_time2.GetHour()];
	m_catalog[p_time2.GetDay()][p_time2.GetHour()] = strClassHourID;

	std::string strLocationID = m_locations[p_time1.GetDay()][p_time1.GetHour()];
	m_locations[p_time1.GetDay()][p_time1.GetHour()] = m_locations[p_time2.GetDay()][p_time2.GetHour()];
	m_locations[p_time2.GetDay()][p_time2.GetHour()] = strLocationID;
}

const std::string Catalog::GetClassHourID(Time p_time) {
	return m_catalog[p_time.GetDay()][p_time.GetHour()];
}

void Catalog::SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, Time p_time) {
	m_bChanged = true;
	m_catalog[p_time.GetDay()][p_time.GetHour()] = p_strClassHourID;
	m_locations[p_time.GetDay()][p_time.GetHour()] = p_strLocationID;
}

void Catalog::DeleteClassHour(Time p_time) {
	m_catalog[p_time.GetDay()][p_time.GetHour()] = "";
	m_locations[p_time.GetDay()][p_time.GetHour()] = "";
}

const std::string Catalog::GetLocationID(Time p_time) {
	return m_locations[p_time.GetDay()][p_time.GetHour()];
}

void Catalog::SetLocationID(const std::string p_strLocationID, Time p_time) {
	m_locations[p_time.GetDay()][p_time.GetHour()] = p_strLocationID;
}

const nlohmann::json Catalog::GetJSONObj() {
	nlohmann::json json;
	for (int nDay = 0; nDay < m_catalog.size(); nDay++) {
		nlohmann::json array;
		for (int nHour = 0; nHour < m_catalog[nDay].size(); nHour++) {
			nlohmann::json classHour;
			classHour["classID"] = g_classHours[m_catalog[nDay][nHour]].GetClassID();
			classHour["subjectID"] = g_classHours[m_catalog[nDay][nHour]].GetSubjectID();
			classHour["teacherID"] = g_classHours[m_catalog[nDay][nHour]].GetTeacherID();
			classHour["locationID"] = m_locations[nDay][nHour];
			array.push_back(classHour);
		}
		json.push_back(array);
	}
	return json;
}

//even hours
double Catalog::GetEvenDaysFitness(const std::vector<int>& p_coursesNumber) {
	double dFitness = 0;
	for (int i = 0; i < p_coursesNumber.size(); i++) {
		for (int j = 0; j < p_coursesNumber.size(); j++) {
			dFitness -= pow(abs(p_coursesNumber[i] - p_coursesNumber[j]), 2);
		}
	}
	return dFitness;
}

//no empty hours between courses
double Catalog::GetNoHoleHoursFitness(bool& p_bHasEmptyHours, bool bStrongConstraint)
{
	if (!p_bHasEmptyHours)
		return 0;

	p_bHasEmptyHours = false;
	if(bStrongConstraint)
		m_bActive = false;
	return -4;
}

//can t put days on ineligible days
double Catalog::GetInactiveDaysFitness(Time p_time, const std::vector<std::pair<int, int>>& p_inactiveDays) {
	auto date = std::make_pair(p_time.GetDay(), p_time.GetHour());
	if (std::find(p_inactiveDays.begin(), p_inactiveDays.end(), date) != p_inactiveDays.end()) {
		m_bActive = false;
		return -10;
	}
	return 0;
}