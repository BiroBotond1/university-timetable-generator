#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <algorithm>
#include <random>
#include <chrono>

#include "Course.h"

int g_changeNumber, g_maxIteration, g_courseNumber;
double g_initialTemperature;
std::vector<Course> g_courses;
std::vector<std::vector<int>> g_catalog;
bool g_bActive;

std::vector<std::string> Split(std::string string, std::string delimenter) {
    int start, end = -1 * delimenter.size();
    auto substrings = std::vector<std::string>();
    do {
        start = end + delimenter.size();
        end = string.find(delimenter, start);
        substrings.push_back(string.substr(start, end - start));
    } while (end != -1);
    return substrings;
}

std::vector<std::string> ReadLineAndSplit(std::ifstream &fin) {
    std::string line;
    std::getline(fin, line);
    auto substrings = Split(line, " ");
    return substrings;
}

int ReadAndConvertFirstInt(std::ifstream& fin) {
    return std::stoi(ReadLineAndSplit(fin)[0]);
}

void Read(std::string fileName) {
    std::ifstream fin(fileName);
    g_changeNumber = ReadAndConvertFirstInt(fin);
    g_maxIteration = ReadAndConvertFirstInt(fin);
    g_initialTemperature = double(ReadAndConvertFirstInt(fin));
    g_courseNumber = ReadAndConvertFirstInt(fin);
    for (int i = 0; i < g_courseNumber; i++) {
        g_courses.push_back(Course{ ReadLineAndSplit(fin) });
    }
}

int randInt(int a, int b) {
    std::random_device dev;
    std::mt19937 rng(dev());
    std::uniform_int_distribution<std::mt19937::result_type> dist6(a, b);
    return dist6(rng);
}

double Rand() {
    std::mt19937_64 rng;
    uint64_t timeSeed = std::chrono::high_resolution_clock::now().time_since_epoch().count();
    std::seed_seq ss{ uint32_t(timeSeed & 0xffffffff), uint32_t(timeSeed >> 32) };
    rng.seed(ss);
    std::uniform_real_distribution<double> unif(0, 1);
    return unif(rng);
}

void InitCatalog() {
    g_bActive = true;
    g_catalog = std::vector<std::vector<int>>();
    for (int i = 0; i < 5; i++) {
        g_catalog.push_back(std::vector<int> {});
        for (int j = 0; j < 8; j++) {
            g_catalog[i].push_back(-1);
        }
    }
    for (int i = 0; i < g_courseNumber; i++) {
        auto invalidTimes = g_courses[i].GetInvalidTimes();
        for (int j = 0; j < g_courses[i].GetNumber(); j++) {
            int day = 0, hour = 0;
            do
            {
                day = randInt(0, 4);
                hour = randInt(0, 7);
            } while (std::find(invalidTimes[day].begin(), invalidTimes[day].end(), hour) != invalidTimes[day].end() || g_catalog[day][hour] != -1);
            g_catalog[day][hour] = i;
        }
    }
}

float Fitness(std::vector<std::vector<int>> p_catalog) {
    std::vector<int> courseNumberOnADay;
    std::vector<int> coursesNumbers;
    for (int j = 0; j < g_courseNumber; j++) {
        courseNumberOnADay.push_back(0);
        coursesNumbers.push_back(0);
    }
    float fitnessValue = 1000;
    g_bActive = true;
    for (int i = 0; i < p_catalog.size(); i++) {
        int hasEmptyHoursBetweenCourses = 0;
        bool hasEmptyHours = false;

        for (int j = 0; j < p_catalog[i].size(); j++) {
            if (p_catalog[i][j] == -1) {
                hasEmptyHours = true;
                continue;
            }
            courseNumberOnADay[p_catalog[i][j]]++;
            coursesNumbers[i]++;

            //a prof can't work on invalid day
            auto invalidTimes = g_courses[p_catalog[i][j]].GetInvalidTimes();
            if (std::find(invalidTimes[i].begin(), invalidTimes[i].end(), j) != invalidTimes[i].end()) {
                fitnessValue -= 10;
                g_bActive = false;
            }

            if (hasEmptyHours) {
                hasEmptyHoursBetweenCourses++;
                hasEmptyHours = false;
                g_bActive = false;
            }
            //the courses starts at 8
            fitnessValue += std::abs(j - 8);
        }
        //no empty hours between courses
        fitnessValue -= hasEmptyHoursBetweenCourses * 10;

        //just 1 type of course on each day
        for (int j = 0; j < g_courseNumber; j++) {
            if (courseNumberOnADay[j] > 1) {
                fitnessValue -= courseNumberOnADay[j]*2;
                g_bActive = false;
            }
            courseNumberOnADay[j] = 0;
        }  
    }

    //even hours
    for (int i = 0; i < g_courseNumber; i++) {
        for (int j = 0; j < g_courseNumber; j++) {
            fitnessValue -= pow(abs(coursesNumbers[i] - coursesNumbers[j]), 2);
        }
    }

    if (g_bActive) {
        fitnessValue += 1000;
    }
    
    return fitnessValue;
}

float Fitness() {
    return Fitness(g_catalog);
}

std::vector<std::vector<int>> Change(std::vector<std::vector<int>> p_catalog) {
    int day1 = randInt(0, 4);
    int hour1 = randInt(0, 7);
    int day2 = randInt(0, 4);
    int hour2 = randInt(0, 7);
    int toSwitch = p_catalog[day1][hour1];
    p_catalog[day1][hour1] = p_catalog[day2][hour2];
    p_catalog[day2][hour2] = toSwitch;
    return p_catalog;
}

std::vector<std::vector<int>> Changes() {
    auto ToChange = g_catalog;
    for (int i = 0; i < g_changeNumber; i++) {
        ToChange = Change(ToChange);
    }
    return ToChange;
}

double LinearAnnealing(int i) {
    return g_initialTemperature / (1 + 0.5 * i);
}

void SimulatedAnnealing() {
    g_bActive = true;
    double t = g_initialTemperature;
    std::vector<std::vector<int>> best = g_catalog;
    int i = 0;
    while (i < g_maxIteration && t > 0.00001) {
        std::vector<std::vector<int>> w = Changes();
        double r = Rand();
        double fitnessW = Fitness(w);
        double fitnessC = Fitness();
        if (Fitness(w) > Fitness() || r < exp((Fitness(w) - Fitness()) / t)) {
            g_catalog = w;
        }
        i++;
        t = LinearAnnealing(i);
        if (Fitness() > Fitness(best)) {
            best = g_catalog;
        }
    }
    g_catalog =  best;
}

void WriteCatalog() {
    if (g_bActive)
        std::cout << " helyes " << std::endl;
    else
        std::cout << " helytelen " << std::endl;
    for (int i = 0; i < g_catalog.size(); i++) {
        std::cout << i << ".nap:" << std::endl;
        for (int j = 0; j < g_catalog[i].size(); j++) {
            if (g_catalog[i][j] == -1) {
                std::cout << "      " << j + 8 << " ora: -------------" << std::endl;
                continue;
            }
            std::cout << "      " << j + 8 << " ora: " << g_courses[g_catalog[i][j]].GetName() << std::endl;
        }
    }
}

int main()
{
    Read("input.txt");
    InitCatalog();
    Fitness();
    WriteCatalog();
    std::cout << "-----------------------------------------" << std::endl;
    SimulatedAnnealing();
    WriteCatalog();
}