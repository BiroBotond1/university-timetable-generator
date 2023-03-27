#include "SubCourse.h"
#include "Global.h"

SubCourse::SubCourse(const nlohmann::json &jsonSubCourse) {
	m_courseType = jsonSubCourse["type"];
	m_nMajorID = jsonSubCourse["majorID"];
	m_nTeacherID = jsonSubCourse["teacherID"]; 
	m_nNumberOfHours = jsonSubCourse["numberOfHours"];
	m_nCourseID = jsonSubCourse["courseID"];
	m_nlocationID = jsonSubCourse["locationID"];
	m_eCoursePeriod = jsonSubCourse["coursePeriod"];
	m_nGroupID = jsonSubCourse["groupID"];
}

int SubCourse::GetNumberOfHours() {
	return m_nNumberOfHours;
}

CourseType SubCourse::GetCourseType() {
	return m_courseType;
}

int SubCourse::GetTeacherID() {
	return m_nTeacherID;
}

int SubCourse::GetLocationID() {
	return m_nlocationID;
}

CoursePeriod SubCourse::GetCoursePeriod() {
	return m_eCoursePeriod;
}

int SubCourse::GetMajorID() {
	return m_nMajorID;
}

int SubCourse::GetCourseID() {
	return m_nCourseID;
}

int SubCourse::GetGroupID() {
	return m_nGroupID;
}

std::string SubCourse::ToString() {
	std::string stdCourseType = ToStringCourseType();
	//std::string majorName = g_majors[m_nMajorID].GetName();
	std::string teacherName = g_teachers[m_nTeacherID].GetName();
	std::string courseName = g_courses[m_nCourseID].GetName();
	std::string locationName = g_locations[m_nlocationID].GetName();
	std::string groupName = g_groupes[m_nGroupID].GetName();
	std::string space = " ";
	return courseName + space + stdCourseType + space + groupName + space + teacherName + space + locationName;
}

std::string	SubCourse::ToStringCourseType() {
	switch (m_courseType) {
	case CourseType::lecture:
		return "Eloadas";
	case CourseType::lab:
		return "Labor";
	case CourseType::seminar:
		return "Szeminarium";
	}
}