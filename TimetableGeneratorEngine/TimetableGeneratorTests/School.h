#pragma once

//builds the input document the backend sends (ImportExportService.getTimetableData), using each
//name as its id; classes, teachers and subjects named in AddHours are created on first use
class School
{
public:
	School()
	{
		//the keys TimetableConfig reads; all off, since these tests are about placement, not fitness
		for (const auto* key : { "OneTypeOfCourseOnADayClass", "ClassCoursesStartsAtEight", "NoHoleHoursInClass",
			"EvenHoursInClass", "NoHoleHoursInTeacher", "EvenHoursInTeacher", "CoursesWeightInClass" })
			m_json[key] = false;

		for (const auto* array : { "teachers", "locations", "classes", "subjects", "classHours" })
			m_json[array] = nlohmann::json::array();
	}

	School& AddClass(const std::string& p_name)
	{
		if (!Has("classes", p_name))
			m_json["classes"].push_back({ { "_id", p_name }, { "name", p_name }, { "location", "Room " + p_name } });
		return *this;
	}

	School& AddTeacher(const std::string& p_name)
	{
		if (!Has("teachers", p_name))
			m_json["teachers"].push_back({ { "_id", p_name }, { "name", p_name }, { "inappropriateDates", nlohmann::json::array() } });
		return *this;
	}

	School& AddRoom(const std::string& p_name)
	{
		if (!Has("locations", p_name))
			m_json["locations"].push_back({ { "_id", p_name }, { "name", p_name }, { "reservedDates", nlohmann::json::array() } });
		return *this;
	}

	School& AddSubject(const std::string& p_name, const std::vector<std::string>& p_rooms = {})
	{
		if (Has("subjects", p_name))
			return *this;

		auto locations = nlohmann::json::array();
		for (const auto& room : p_rooms)
			locations.push_back({ { "_id", room } });

		m_json["subjects"].push_back({ { "_id", p_name }, { "name", p_name }, { "locations", locations } });
		return *this;
	}

	School& AddHours(const std::string& p_class, const std::string& p_teacher, const std::string& p_subject, int p_nNumber)
	{
		AddClass(p_class).AddTeacher(p_teacher).AddSubject(p_subject);

		m_json["classHours"].push_back({
			{ "_id", "classHour" + std::to_string(m_json["classHours"].size()) },
			{ "number", p_nNumber },
			{ "weight", 1 },
			{ "teacher", { { "_id", p_teacher } } },
			{ "class", { { "_id", p_class } } },
			{ "subject", { { "_id", p_subject } } } });
		return *this;
	}

	std::string ToJson() const { return m_json.dump(); }

private:
	bool Has(const char* p_array, const std::string& p_id) const
	{
		const auto& array = m_json[p_array];
		return std::any_of(array.begin(), array.end(), [&](const nlohmann::json& p_entity) { return p_entity["_id"] == p_id; });
	}

	nlohmann::json m_json;
};
