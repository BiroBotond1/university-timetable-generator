#include "TimetableGenerator.h"

int main()
{
    TimetableGenerator generator;
    generator.Read("D:/Egyetem/Allamvizsga/university-timetable-generator/TimetableGeneratorEngine/TimetableGenerator/in.json");
    generator.InitCatalogs();
    auto t_start = std::chrono::high_resolution_clock::now();
    generator.SimulatedAnnealing();
    auto t_end = std::chrono::high_resolution_clock::now();
    generator.WriteCatalog();
    double elapsed_time_ms = std::chrono::duration<double, std::milli>(t_end - t_start).count();
    //std::cout << std::endl << std::endl << "Elapsed time: " << elapsed_time_ms << " ms";
}