#include "DateTime.h"

DateTime::DateTime(const nlohmann::json &jsonDateTime) {
	m_eDay = jsonDateTime["day"];
	m_eWeek = jsonDateTime["hour"];
	m_nHour = jsonDateTime["week"];
}