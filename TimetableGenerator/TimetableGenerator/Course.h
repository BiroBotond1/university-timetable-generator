#pragma once

#include <iostream>
#include <vector>

class Course {
	std::string m_name;
	int m_number;
	std::vector<std::vector<int>> m_invalidTimes;

public:
	Course(std::vector<std::string> p_invalidTimes);
	int GetNumber();
	std::string GetName();
	std::vector<std::vector<int>> GetInvalidTimes();
};