#include "Catalog.h"
#include "Global.h"

Catalog::Catalog() {
	m_bChanged = true;
	m_dFitness = 0;
	m_catalog = std::vector<std::vector<std::string>>(DAY_COUNT, std::vector<std::string>(HOUR_COUNT, ""));
	m_locations = std::vector<std::vector<std::string>>(DAY_COUNT, std::vector<std::string>(HOUR_COUNT, ""));
}

Catalog::Catalog(const Catalog& rhsCatalog) {
	m_bActive = rhsCatalog.m_bActive;
	m_bChanged = rhsCatalog.m_bChanged;
	m_dFitness = rhsCatalog.m_dFitness;
	m_catalog = rhsCatalog.m_catalog;
	m_locations = rhsCatalog.m_locations;
}

const bool Catalog::IsFreeDay(const int p_nDay, const int p_nHour) {
	return m_catalog[p_nDay][p_nHour].compare("") == 0;
}

void Catalog::Add(const int p_nDay, const int p_nHour, const std::string p_strSubCourseID) {
	m_catalog[p_nDay][p_nHour] = p_strSubCourseID;
}

void Catalog::Swap(const int p_nDay1, const int p_nHour1, const int p_nDay2, const int p_nHour2) {
	m_bChanged = true;
	std::string strClassHourID = m_catalog[p_nDay1][p_nHour1];
	m_catalog[p_nDay1][p_nHour1] = m_catalog[p_nDay2][p_nHour2];
	m_catalog[p_nDay2][p_nHour2] = strClassHourID;

	std::string strLocationID = m_locations[p_nDay1][p_nHour1];
	m_locations[p_nDay1][p_nHour1] = m_locations[p_nDay2][p_nHour2];
	m_locations[p_nDay2][p_nHour2] = strLocationID;
}

const std::string Catalog::GetClassHourID(const int p_nDay, const int p_nHour) {
	return m_catalog[p_nDay][p_nHour];
}

void Catalog::SetClassHour(const std::string p_strClassHourID, const std::string p_strLocationID, const int p_nDay, const int p_nHour) {
	m_bChanged = true;
	m_catalog[p_nDay][p_nHour] = p_strClassHourID;
	m_locations[p_nDay][p_nHour] = p_strLocationID;
}

void Catalog::DeleteClassHour(const int p_nDay, const int p_nHour) {
	m_catalog[p_nDay][p_nHour] = "";
	m_locations[p_nDay][p_nHour] = "";
}

const std::string Catalog::GetLocationID(const int p_nDay, const int p_nHour) {
	return m_locations[p_nDay][p_nHour];
}

void Catalog::SetLocationID(const std::string p_strLocationID, const int p_nDay, const int p_nHour) {
	m_locations[p_nDay][p_nHour] = p_strLocationID;
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
const double Catalog::GetEvenDaysFitness(const std::vector<int>& p_coursesNumber) {
	double dFitness = 0;
	for (int i = 0; i < p_coursesNumber.size(); i++) {
		for (int j = 0; j < p_coursesNumber.size(); j++) {
			dFitness -= pow(abs(p_coursesNumber[i] - p_coursesNumber[j]), 2);
		}
	}
	return dFitness;
}

//no empty hours between courses
const double Catalog::GetNoHoleHoursFitness(bool& p_bHasEmptyHours, bool bStrongConstraint)
{
	if (!p_bHasEmptyHours)
		return 0;

	p_bHasEmptyHours = false;
	if(bStrongConstraint)
		m_bActive = false;
	return -4;
}

//can t put days on ineligible days
const double Catalog::GetInactiveDaysFitness(const int p_nDay, const int p_nHour, const std::vector<std::pair<int, int>>& p_inactiveDays) {
	auto date = std::make_pair(p_nDay, p_nHour);
	if (std::find(p_inactiveDays.begin(), p_inactiveDays.end(), date) != p_inactiveDays.end()) {
		m_bActive = false;
		return -10;
	}
	return 0;
}