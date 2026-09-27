#pragma once
#include <stdexcept>

//the input cannot be scheduled; the message names the entities involved, for the user to read
class GenerationError : public std::runtime_error
{
public:
	using std::runtime_error::runtime_error;
};
