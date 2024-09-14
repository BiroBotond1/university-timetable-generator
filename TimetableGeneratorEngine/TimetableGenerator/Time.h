#pragma once

/*enum Day {
	MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY
};

enum Hour {
	HOUR_8, HOUR_9, HOUR_10, HOUR_11, HOUR_12, HOUR_13, HOUR_14, HOUR_15, HOUR_16, HOUR_17, HOUR_18
};*/

class Time
{
public:
	Time() : m_day(0), m_hour(0) {};
	Time(int p_day, int p_hour) : m_day(p_day), m_hour(p_hour) {};
	int GetDay()	{ return m_day; };
	int GetHour()	{ return m_hour; };

private:
	int m_day;
	int m_hour;
};


