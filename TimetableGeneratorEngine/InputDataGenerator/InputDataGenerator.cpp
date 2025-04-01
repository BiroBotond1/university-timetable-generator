#include <iostream>
#include <fstream>
#include <random>
#include <fstream>
#include <chrono>
#include <unordered_map>
#include <unordered_set>
#include "nlohmann/json.hpp"
#include <sstream>

#define CLASS_NUMBER 12
#define CLASSHOUR_NUMBER_PER_WEEK 34
#define LOCATION_CLASSHOUR_NUMBER_PER_WEEK 30
#define TEACHER_CLASSHOUR_NUMBER_PER_WEEK 26
#define DAYS 5
#define HOURS 8

using json = nlohmann::json;

std::string GenerateMongoObjectId();

class Class {
public:
    std::string id;
    std::string name;
    std::string location;

    Class(std::string p_name, std::string p_location) : id(GenerateMongoObjectId()), name(p_name), location(p_location) {}

    inline json GetJson() {
        json res;
        res["_id"] = id;
        res["name"] = name;
        res["location"] = location;
        return res;
    }
};

class Location {
public:
    std::string id;
    std::string name;
    std::vector<std::vector<int>> reservedDates;

    Location(std::string p_name) : id(GenerateMongoObjectId()), name(p_name), reservedDates(DAYS, std::vector<int>(HOURS, 0)) {}

    inline json GetJson() {
        json res;
        res["_id"] = id;
        res["name"] = name;
        res["reservedDates"] = reservedDates;
        return res;
    }
};

class Subject {
public:
    std::string id;
    std::string name;
    std::vector<Location> locations;

    Subject(std::string p_name) : id(GenerateMongoObjectId()), name(p_name) {}
    Subject(std::string p_name, std::vector<Location> p_locations) : id(GenerateMongoObjectId()), name(p_name), locations(p_locations) {}

    inline json GetJson() {
        json res;
        res["_id"] = id;
        res["name"] = name;
        std::vector<json> jsonLocations;
        for (auto location : locations)
        {
            jsonLocations.push_back(location.GetJson());
        }
        res["locations"] = jsonLocations;
       
        return res;
    }
};

class Teacher {
public:
    std::string id;
    std::string name;
    std::vector<std::vector<int>> inappropriateDates;

    Teacher(std::string p_name) : id(GenerateMongoObjectId()), name(p_name), inappropriateDates(DAYS, std::vector<int>(HOURS, 0)) {}

    inline json GetJson() {
        json res;
        res["_id"] = id;
        res["name"] = name;
        res["inappropriateDates"] = inappropriateDates;
        return res;
    }
};

class ClassHour {
public:
    std::string id;
    int number;
    Class classs;
    Teacher teacher;
    Subject subject;
    float weight;

    ClassHour(int p_number, Class p_classs, Teacher p_teacher, Subject p_subject, float p_weight)
        : id(GenerateMongoObjectId()), number(p_number), classs(p_classs), teacher(p_teacher), subject(p_subject), weight(p_weight) {}

    inline json GetJson() {
        json res;
        res["_id"] = id;
        res["number"] = number;
        res["class"] = classs.GetJson();
        res["subject"] = subject.GetJson();
        res["teacher"] = teacher.GetJson();
        res["weight"] = weight;
        return res;
    }
};

std::vector<std::string> allSubjects = { "Matematika", "Roman", "Magyar", "Angol", "Nemet", "Kemia", "Fizika", "Torna", "Rajz", "Foldrajz", "Tortenelem",
    "Informatika", "Biologia", "Technologia", "Latin", "Francia", "Vallas", "Szobraszat", "Festeszet", "Uszas" };

int RandInt(int a, int b);
double Rand();
Subject GetUnusedSubject(const std::unordered_set<std::string>& usedSubjects, const std::vector<Subject>& p_subjects);
bool SubjectHasLocation(std::string subject);
std::unordered_map<std::string, int> SetInitialSubjectLocationNumbers();
std::unordered_map<std::string, int> SetInitialSubjectTeacherNumbers();
void WriteCatalog(std::vector<Class> p_classes, std::vector<Subject> subjects, std::vector<Location> p_locations, std::vector<Teacher> p_teachers, std::vector<ClassHour> classHours);

int main(int argc, char* argv[])
{
    std::vector<Class> classes;

    std::vector<Location> locations;
    std::unordered_map<std::string, int> subjectLocationUsed;
    std::unordered_map<std::string, int> subjectLocationClassHours;
    auto subjectLocationNumbers = SetInitialSubjectLocationNumbers();
    std::unordered_map<std::string, std::vector<Location>> subjectLocations;

    std::vector<Teacher> teachers;
    std::unordered_map<std::string, int> subjectTeacherUsed;
    std::unordered_map<std::string, int> subjectTeacherClassHours;
    std::unordered_map<std::string, std::vector<Teacher>> subjectTeachers;

    std::vector<ClassHour> classHours;

    auto subjectTeacherNumbers = SetInitialSubjectTeacherNumbers();

    //Create the subject objects
    std::vector<Subject> subjects;
    for (auto subject : allSubjects)
    {
        subjects.emplace_back(subject/*, subjectLocations[subject]*/);
    }

    for (int i = 0; i < CLASS_NUMBER; i++)
    {
        //Class
        std::string className = std::to_string(i + 1) + ". osztaly";
        std::string classLocation = std::to_string(i + 50) + "A";
        classes.emplace_back(className, classLocation);

        int classHourNumber = 0;
        int classHourTotal = CLASSHOUR_NUMBER_PER_WEEK + RandInt(0, 4) - 2;
        std::unordered_set<std::string> usedSubjects;

        while (classHourNumber < classHourTotal)
        {
            int subjectClassHourNumber = classHourTotal - classHourNumber < 4 ? classHourTotal - classHourNumber : RandInt(1, 4);

            //Get subject
            Subject subject = GetUnusedSubject(usedSubjects, subjects);

            usedSubjects.insert(subject.name);

            //Location
            if (SubjectHasLocation(subject.name)) {
                
                //First location, we have to add 1 Location to Locations
                if (subjectLocationUsed[subject.name] == 0) 
                {
                    locations.emplace_back(subject.name + " terem");
                    subjectLocationUsed[subject.name] = 1;
                    subjectLocations[subject.name].push_back(locations[locations.size() - 1]);
                }

                //The previous Location is full we have to add a new
                if (subjectLocationClassHours[subject.name] + subjectClassHourNumber > LOCATION_CLASSHOUR_NUMBER_PER_WEEK)
                {
                    subjectLocationClassHours[subject.name] = 0;
                    subjectLocationNumbers[subject.name]++;
                    locations.emplace_back(subject.name + " terem " + std::to_string(subjectLocationNumbers[subject.name]));
                    subjectLocations[subject.name].push_back(locations[locations.size() - 1]);
                }

                subjectLocationClassHours[subject.name] += subjectClassHourNumber;
            }

            //Teacher
            //First teacher, we have to add 1 Teacher to Teachers
            if (subjectTeacherUsed[subject.name] == 0) 
            {
                teachers.emplace_back(subject.name + " tanar");
                subjectTeacherUsed[subject.name] = 1;
                subjectTeachers[subject.name].push_back(teachers[teachers.size() - 1]);
            }

            //The previous Teacher is full we have to add a new
            if (subjectTeacherClassHours[subject.name] + subjectClassHourNumber > TEACHER_CLASSHOUR_NUMBER_PER_WEEK)
            {
                subjectTeacherClassHours[subject.name] = 0;
                subjectTeacherNumbers[subject.name]++;
                teachers.emplace_back(subject.name + " tanar" + std::to_string(subjectTeacherNumbers[subject.name]));
                subjectTeachers[subject.name].push_back(teachers[teachers.size() - 1]);
            }

            //Get the actual teacher
            auto teacher = subjectTeachers[subject.name][subjectTeachers[subject.name].size() - 1];

            subjectTeacherClassHours[subject.name] += subjectClassHourNumber;

            classHours.emplace_back(subjectClassHourNumber, classes[classes.size() - 1], teacher, subject, 1.0f);

            classHourNumber += subjectClassHourNumber;
        }
    }

    //Fill the subjects locations
    for (auto& subject : subjects)
    {
        subject.locations = subjectLocations[subject.name];
    }

    //Change fake subjects in the classHours
    for (auto& classHour : classHours) {
        classHour.subject.locations = subjectLocations[classHour.subject.name];
    }

    std::cout << "Subjects: " << std::endl;
    for (auto subject : subjects) {
        std::cout << subject.name << " Locations: ";
        for (auto location : subject.locations) {
            std::cout << location.name << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Classes: " << std::endl;
    for (auto classs : classes) {
        std::cout << classs.name << " " << classs.location << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Locations: " << std::endl;
    for (auto location : locations) {
        std::cout << location.name << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Teachers: " << std::endl;
    for (auto teacher : teachers) {
        std::cout << teacher.name << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Class Hours: " << std::endl;
    for (auto classHour : classHours) {
        std::cout << classHour.number << " " << classHour.classs.name << " " << classHour.subject.name << " " << classHour.teacher.name << std::endl;
    }
    std::cout << std::endl;

    WriteCatalog(classes, subjects, locations, teachers, classHours);
}

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

std::unordered_map<std::string, int> SetInitialSubjectLocationNumbers()
{
    std::unordered_map<std::string, int> subjectLocationNumbers;

    for (auto& subject : allSubjects)
    {
        if (SubjectHasLocation(subject))
        {
            subjectLocationNumbers[subject] = 1;
        }
    }

    return subjectLocationNumbers;
}

std::unordered_map<std::string, int> SetInitialSubjectTeacherNumbers()
{
    std::unordered_map<std::string, int> subjectTeacherNumbers;

    for (auto& subject : allSubjects)
    {
        subjectTeacherNumbers[subject] = 1;
    }

    return subjectTeacherNumbers;
}

Subject GetUnusedSubject(const std::unordered_set<std::string>& usedSubjects, const std::vector<Subject>& p_subjects)
{
    std::string subjectName = allSubjects[RandInt(0, allSubjects.size() - 1)];
    while (usedSubjects.count(subjectName)) {
        subjectName = allSubjects[RandInt(0, allSubjects.size() - 1)];
    }

    Subject foundSubject("");
    for (auto subject : p_subjects) {
        if (subject.name == subjectName)
        {
            foundSubject = subject;
        }
    }

    return foundSubject;
}


std::unordered_map<std::string, bool> subjectsHasLocation =
{
      {"Matematika", false}, {"Roman", false}, {"Magyar", false}, {"Angol", false}, {"Nemet", false},
      {"Kemia", true}, {"Fizika", true}, {"Torna", true}, {"Rajz", true}, {"Foldrajz", false},
      {"Tortenelem", false}, {"Informatika", true}, {"Biologia", false}, {"Technologia", false},
      {"Latin", false}, {"Francia", false}, {"Vallas", false}, {"Szobraszat", true}, {"Festeszet", true},
      {"Uszas", false}
};

bool SubjectHasLocation(std::string subject)
{
    return subjectsHasLocation[subject];
}

void WriteCatalog(std::vector<Class> p_classes, std::vector<Subject> p_subjects, std::vector<Location> p_locations, std::vector<Teacher> p_teachers, std::vector<ClassHour> p_classHours)
{
    json res;
    res["OneTypeOfCourseOnADayClass"] = true;
    res["ClassCoursesStartsAtEight"] = true;
    res["NoHoleHoursInClass"] = true;
    res["EvenHoursInClass"] = true;
    res["NoHoleHoursInTeacher"] = true;
    res["EvenHoursInTeacher"] = true;
    res["CoursesWeightInClass"] = true;

    std::vector<json> jsonClasses;
    for (auto classs : p_classes)
    {
        jsonClasses.push_back(classs.GetJson());
    }

    std::vector<json> jsonSubjects;
    for (auto subject : p_subjects)
    {
        jsonSubjects.push_back(subject.GetJson());
    }

    std::vector<json> jsonLocations;
    for (auto location : p_locations)
    {
        jsonLocations.push_back(location.GetJson());
    }

    std::vector<json> jsonTeachers;
    for (auto teacher : p_teachers)
    {
        jsonTeachers.push_back(teacher.GetJson());
    }

    std::vector<json> jsonClassHours;
    for (auto classHour : p_classHours)
    {
        jsonClassHours.push_back(classHour.GetJson());
    }

    res["classes"] = jsonClasses;
    res["locations"] = jsonLocations;
    res["subjects"] = jsonSubjects;
    res["teachers"] = jsonTeachers;
    res["classHours"] = jsonClassHours;

    std::ofstream file("generated_input.json");
    file << res;
    file.close();
}

std::string GenerateMongoObjectId() {
    std::ostringstream oss;

    // Timestamp (first 4 bytes)
    uint32_t timestamp = static_cast<uint32_t>(std::time(nullptr));
    oss << std::hex << std::setw(8) << std::setfill('0') << timestamp;

    // Random 5 bytes (Machine ID + Process ID)
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<int> dist(0, 255);
    for (int i = 0; i < 5; i++) {
        oss << std::hex << std::setw(2) << std::setfill('0') << dist(gen);
    }

    // Counter (last 3 bytes)
    static uint32_t counter = 0;
    counter = (counter + 1) % 0xFFFFFF; // Ensure it doesn't overflow
    oss << std::hex << std::setw(6) << std::setfill('0') << counter;

    return oss.str();
}