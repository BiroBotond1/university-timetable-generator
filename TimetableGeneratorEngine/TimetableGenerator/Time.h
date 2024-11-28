#pragma once

class Time
{
public:
	Time() : m_day(0), m_hour(0) {};
	Time(int p_day, int p_hour) : m_day(p_day), m_hour(p_hour) {};
	int GetDay() const { return m_day; };
	int GetHour() const { return m_hour; };

private:
	int m_day;
	int m_hour;
};


