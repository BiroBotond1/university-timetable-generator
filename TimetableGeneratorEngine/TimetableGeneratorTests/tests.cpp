#include "stdafx.h"
#include "TimetableGenerator.h"
#include "GenerationError.h"
#include "School.h"
#include <functional>
#include <map>

//The random generator cannot be seeded, so every case checks something that holds for any random
//run: an input that no order can place, or one that every order the engine tries can.

namespace
{
	class TestFailure : public std::runtime_error
	{
	public:
		using std::runtime_error::runtime_error;
	};

	void ExpectGenerationError(const School& p_school, const std::string& p_expectedMessage)
	{
		try
		{
			TimetableGenerator().Run(p_school.ToJson());
		}
		catch (const GenerationError& e)
		{
			if (std::string(e.what()).find(p_expectedMessage) == std::string::npos)
				throw TestFailure("expected a message containing \"" + p_expectedMessage + "\", got \"" + e.what() + "\"");
			return;
		}
		throw TestFailure("expected a GenerationError containing \"" + p_expectedMessage + "\", but generation succeeded");
	}

	//every hour of every class is in the returned catalog, so none was lost in placement or annealing
	void ExpectScheduled(const School& p_school, const std::map<std::string, int>& p_hoursByClass)
	{
		auto output = nlohmann::json::parse(TimetableGenerator().Run(p_school.ToJson()));

		for (const auto& [className, nExpected] : p_hoursByClass)
		{
			if (!output["classCatalogs"].contains(className))
				throw TestFailure("no catalog for class " + className);

			int nPlaced = 0;
			for (const auto& day : output["classCatalogs"][className])
				for (const auto& hour : day)
					if (hour["subject"] != "")
						nPlaced++;

			if (nPlaced != nExpected)
				throw TestFailure(className + ": expected " + std::to_string(nExpected) + " hours, found " + std::to_string(nPlaced));
		}
	}

	School ValidSchool()
	{
		School school;
		school.AddRoom("Lab").AddSubject("Chemistry", { "Lab" });
		for (const auto* clas : { "9A", "9B" })
			school.AddHours(clas, "Kovacs", "Math", 5).AddHours(clas, "Nagy", "History", 4).AddHours(clas, "Szabo", "Chemistry", 2);
		return school;
	}

	const std::map<std::string, std::function<void()>> TEST_CASES = {
		{ "class_over_week", [] {
			ExpectGenerationError(School().AddHours("9A", "Kovacs", "Math", 21).AddHours("9A", "Nagy", "History", 20),
				"Class 9A needs 41 hours, the week has 40.");
		} },

		{ "teacher_over_week", [] {
			ExpectGenerationError(School().AddHours("9A", "Kovacs", "Math", 21).AddHours("9B", "Kovacs", "Math", 20),
				"Teacher Kovacs needs 41 hours, the week has 40.");
		} },

		//42 hours in the only room: no class or teacher is over the week, so this gets past the
		//count check and has to exhaust the placement attempts
		{ "room_over_booked", [] {
			ExpectGenerationError(School().AddRoom("Lab").AddSubject("Chemistry", { "Lab" })
				.AddHours("9A", "Szabo", "Chemistry", 21).AddHours("9B", "Toth", "Chemistry", 21),
				"after 20 attempts: no slot where the class, the teacher and one of the subject's rooms are all free.");
		} },

		{ "no_class_hours", [] {
			ExpectGenerationError(School().AddClass("9A").AddTeacher("Kovacs"), "There are no class hours to schedule.");
		} },

		{ "valid_school", [] {
			ExpectScheduled(ValidSchool(), { { "9A", 11 }, { "9B", 11 } });
		} },

		//the annealing only moves hours within a class, so a class without hours has nothing to move
		{ "class_without_hours", [] {
			ExpectScheduled(ValidSchool().AddClass("10C"), { { "9A", 11 }, { "9B", 11 }, { "10C", 0 } });
		} },

		//T has every slot of the week, so T's hours in A must take exactly the slots V leaves free
		//in B. Placing U and V first would almost always leave no common slot, which is why the
		//busiest teacher goes first. Once placed every slot is full and T is busy in all of them,
		//so no swap exists and the annealing has to stop instead of searching for one.
		{ "only_fits_in_order", [] {
			ExpectScheduled(School().AddHours("A", "U", "Math", 20).AddHours("B", "V", "Math", 20)
				.AddHours("A", "T", "Math", 20).AddHours("B", "T", "Math", 20),
				{ { "A", 40 }, { "B", 40 } });
		} },
	};
}

//runs the named cases, or all of them when none is named
int main(int argc, char** argv)
{
	std::vector<std::string> vNames(argv + 1, argv + argc);
	if (vNames.empty())
	{
		for (const auto& [name, test] : TEST_CASES)
			vNames.push_back(name);
	}

	int nFailed = 0;
	for (const auto& name : vNames)
	{
		auto testCase = TEST_CASES.find(name);
		if (testCase == TEST_CASES.end())
		{
			std::cout << "FAIL  " << name << ": unknown test case" << std::endl;
			nFailed++;
			continue;
		}

		try
		{
			testCase->second();
			std::cout << "ok    " << name << std::endl;
		}
		catch (const std::exception& e)
		{
			std::cout << "FAIL  " << name << ": " << e.what() << std::endl;
			nFailed++;
		}
	}

	return nFailed == 0 ? 0 : 1;
}
