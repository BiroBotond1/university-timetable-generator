#include "stdafx.h"
#include "TimetableGenerator.h"

int main()
{
    TimetableGenerator generator;
    auto output = generator.Run();
    std::cout << output << std::endl;
}