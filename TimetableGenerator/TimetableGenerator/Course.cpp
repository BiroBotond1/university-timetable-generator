#include "Course.h"
#include <string>

Course::Course(std::vector<std::string> courseLine) {
	m_name = courseLine[0];
	m_number = stoi(courseLine[1]);
	for (int i = 0; i < 5; i++) {
		m_invalidTimes.push_back(std::vector<int> {});
	}
	for (int i = 2; i  < courseLine.size(); i+=2) {
		m_invalidTimes[stoi(courseLine[i])].push_back(stoi(courseLine[i+1]));
	}
}

int Course::GetNumber() {
	return m_number;
}

std::string Course::GetName() {
	return m_name;
}

std::vector<std::vector<int>> Course::GetInvalidTimes() {
	return m_invalidTimes;
}