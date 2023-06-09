#include "TimetableGenerator.h"

int main()
{
    TimetableGenerator generator;
    generator.Read("D:/Egyetem/Allamvizsga/university-timetable-generator/TimetableGeneratorEngine/TimetableGenerator/in.json");
    generator.InitCatalogs();
    generator.SimulatedAnnealing();
    generator.WriteCatalog();
}