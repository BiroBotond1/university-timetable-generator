#include <iostream>
#include <random>
#include <fstream>
#include <chrono>
#include <unordered_set>

#define CLASS_NUMBER 5

int RandInt(int a, int b) {
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
//std::unordered_set<std::string> teachers;
std::unordered_set<std::string> subjects({"Matem", "Roman", "Magyar", "Angol", "Nemet",
    "Kemia", "Fizika", "Torna", "Rajz", "Foldrajz", "Tortenelem", "Informatika", "Biologia"});


int main(int argc, char* argv[])
{
    std::ofstream fout("output.txt");
    fout << "Tanarok:" << std::endl; 
    for (auto& subject : subjects) {
        fout << subject << " tanar" << std::endl;
    }
    fout << "Tantargyak:" << std::endl;
    for (auto& subject : subjects) {
        fout << subject << std::endl;
    }
    fout << "Osztalyok:" << std::endl;
    for (int i = 0; i < CLASS_NUMBER; i++) {
        fout << i + 1 << ".osztaly" << std::endl;
    }
    fout << "Orak:" << std::endl;
    for (int i = 0; i < CLASS_NUMBER; i++) {
        std::unordered_set<std::string> usedSubjects;
        for (auto& subject : subjects) {
            int randomClassHourNumberInAWeek = RandInt(1, 4);
            fout << randomClassHourNumberInAWeek << " " << i + 1 << ".osztaly ";
            fout << subject << " " << subject << " tanar " << Rand() << std::endl;
        }
    }
    return 0;
}