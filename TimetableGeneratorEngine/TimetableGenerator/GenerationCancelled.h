#pragma once
#include <stdexcept>

//thrown out of Run once the caller's cancel flag is set; deliberately not a GenerationError, since
//nothing is wrong with the input
class GenerationCancelled : public std::runtime_error
{
public:
	GenerationCancelled() : std::runtime_error("Generation was cancelled.") {}
};
