#pragma once

constexpr int CLASS_NUMBER = 8;
constexpr int CLASSHOUR_NUMBER_PER_WEEK = 34;
constexpr int LOCATION_CLASSHOUR_NUMBER_PER_WEEK = 30;
constexpr int TEACHER_CLASSHOUR_NUMBER_PER_WEEK = 26;
constexpr int CLASSROOM_START_INDEX = 50;
constexpr int CLASS_HOUR_VARIATION = 2;

enum class SubjectType
{
	Math,
	Romanian,
	Hungarian,
	English,
	German,
	Chemistry,
	Physics,
	PhysicalEducation,
	Art,
	Geography,
	History,
	IT,
	Biology,
	Technology,
	Latin,
	French,
	Religion,
	Sculpture,
	Painting,
	Swimming,
};

extern const std::vector<SubjectType> g_subjectTypes;

bool IsSubjectContainsLocation(SubjectType subjectType);

std::string GetSubjectName(SubjectType subjectType);