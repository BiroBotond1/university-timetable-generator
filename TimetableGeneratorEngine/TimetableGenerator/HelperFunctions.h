#pragma once
#include "stdafx.h"

enum Day {
	Monday = 0,
	Tuesday = 1,
	Wednesday = 2,
	Thursday = 3,
	Friday = 4,
	Saturday = 5,
	Sunday = 6,
};

enum Week {
	Both = 0,
	First = 1,
	Second = 2,
	No = 3,
};

enum CoursePeriod {
	weekly = 0,
	biweekly = 1,
};

enum CourseType {
	lecture = 0,
	seminar = 1,
	lab = 2,
};


int RandInt(int a, int b);

double Rand();

