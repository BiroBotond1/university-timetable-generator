#include "stdafx.h"
#include "Config.h"

const std::vector<SubjectType> g_subjectTypes{ SubjectType::Math, SubjectType::Romanian, SubjectType::Hungarian, SubjectType::English, SubjectType::German, SubjectType::Chemistry, SubjectType::Physics, SubjectType::PhysicalEducation, SubjectType::Art,
SubjectType::Geography, SubjectType::History, SubjectType::IT, SubjectType::Biology, SubjectType::Technology, SubjectType::Latin, SubjectType::French, SubjectType::Religion, SubjectType::Sculpture, SubjectType::Painting, SubjectType::Swimming };

bool IsSubjectContainsLocation(SubjectType subjectType)
{
	switch (subjectType)
	{
	case SubjectType::Math:
	case SubjectType::Romanian:
	case SubjectType::Hungarian:
	case SubjectType::English:
	case SubjectType::German:
	case SubjectType::Geography:
	case SubjectType::History:
	case SubjectType::Biology:
	case SubjectType::Technology:
	case SubjectType::Latin:
	case SubjectType::French:
	case SubjectType::Religion:
		return false;

	case SubjectType::Chemistry:
	case SubjectType::Physics:
	case SubjectType::PhysicalEducation:
	case SubjectType::Art:
	case SubjectType::IT:
	case SubjectType::Sculpture:
	case SubjectType::Painting:
	case SubjectType::Swimming:
		return true;
	default:
		return false;
	}
}

std::string GetSubjectName(SubjectType subjectType)
{
	switch (subjectType)
	{
	case SubjectType::Math: return "Matematika";
	case SubjectType::Romanian: return "Roman";
	case SubjectType::Hungarian: return "Magyar";
	case SubjectType::English: return "Angol";
	case SubjectType::German: return "Nemet";
	case SubjectType::Chemistry: return "Kemia";
	case SubjectType::Physics: return "Fizika";
	case SubjectType::PhysicalEducation: return "Torna";
	case SubjectType::Art: return "Rajz";
	case SubjectType::Geography: return "Foldrajz";
	case SubjectType::History: return "Tortenelem";
	case SubjectType::IT: return "Informatika";
	case SubjectType::Biology: return "Biologia";
	case SubjectType::Technology: return "Technologia";
	case SubjectType::Latin: return "Latin";
	case SubjectType::French: return "Francia";
	case SubjectType::Religion: return "Vallas";
	case SubjectType::Sculpture: return "Szobraszat";
	case SubjectType::Painting: return "Festeszet";
	case SubjectType::Swimming: return "Uszas";
	default:
		return "";
	}
}