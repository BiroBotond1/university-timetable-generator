#pragma once

#include "stdafx.h"
#include "HelperFunctions.h"

class SubCourse {
	CourseType		m_courseType;
	int				m_nTeacherID;
	int				m_nNumberOfHours;
	int				m_nlocationID;
	int				m_nMajorID;
	int				m_nCourseID;
	int				m_nGroupID;
	CoursePeriod	m_eCoursePeriod;
	std::string		ToStringCourseType();
public:
	SubCourse(const nlohmann::json &jsonSubCourse);
	int GetNumberOfHours();
	CourseType GetCourseType();
	int GetTeacherID();
	int GetLocationID();
	int GetMajorID();
	int GetCourseID();
	int GetGroupID();
	CoursePeriod GetCoursePeriod();
	std::string ToString();
};