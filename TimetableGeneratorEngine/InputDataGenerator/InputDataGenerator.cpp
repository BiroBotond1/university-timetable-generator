#include "stdafx.h"
#include "InputDataGenerator.h"
#include "Random.h"

void InputDataGenerator::Run() 
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
    for (auto subject : m_allSubjects)
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
        int classHourTotal = CLASSHOUR_NUMBER_PER_WEEK + Random::GetInt(0, 4) - 2;
        std::unordered_set<std::string> usedSubjects;

        while (classHourNumber < classHourTotal)
        {
            int subjectClassHourNumber = classHourTotal - classHourNumber < 4 ? classHourTotal - classHourNumber : Random::GetInt(1, 4);

            //Get subject
            Subject subject = GetUnusedSubject(usedSubjects, subjects);

            usedSubjects.insert(subject.GetName());

            //Location
            if (SubjectHasLocation(subject.GetName())) {

                //First location, we have to add 1 Location to Locations
                if (subjectLocationUsed[subject.GetName()] == 0)
                {
                    locations.emplace_back(subject.GetName() + " terem");
                    subjectLocationUsed[subject.GetName()] = 1;
                    subjectLocations[subject.GetName()].push_back(locations[locations.size() - 1]);
                }

                //The previous Location is full we have to add a new
                if (subjectLocationClassHours[subject.GetName()] + subjectClassHourNumber > LOCATION_CLASSHOUR_NUMBER_PER_WEEK)
                {
                    subjectLocationClassHours[subject.GetName()] = 0;
                    subjectLocationNumbers[subject.GetName()]++;
                    locations.emplace_back(subject.GetName() + " terem " + std::to_string(subjectLocationNumbers[subject.GetName()]));
                    subjectLocations[subject.GetName()].push_back(locations[locations.size() - 1]);
                }

                subjectLocationClassHours[subject.GetName()] += subjectClassHourNumber;
            }

            //Teacher
            //First teacher, we have to add 1 Teacher to Teachers
            if (subjectTeacherUsed[subject.GetName()] == 0)
            {
                teachers.emplace_back(subject.GetName() + " tanar");
                subjectTeacherUsed[subject.GetName()] = 1;
                subjectTeachers[subject.GetName()].push_back(teachers[teachers.size() - 1]);
            }

            //The previous Teacher is full we have to add a new
            if (subjectTeacherClassHours[subject.GetName()] + subjectClassHourNumber > TEACHER_CLASSHOUR_NUMBER_PER_WEEK)
            {
                subjectTeacherClassHours[subject.GetName()] = 0;
                subjectTeacherNumbers[subject.GetName()]++;
                teachers.emplace_back(subject.GetName() + " tanar" + std::to_string(subjectTeacherNumbers[subject.GetName()]));
                subjectTeachers[subject.GetName()].push_back(teachers[teachers.size() - 1]);
            }

            //Get the actual teacher
            auto teacher = subjectTeachers[subject.GetName()][subjectTeachers[subject.GetName()].size() - 1];

            subjectTeacherClassHours[subject.GetName()] += subjectClassHourNumber;

            classHours.emplace_back(subjectClassHourNumber, classes[classes.size() - 1], teacher, subject, 1.0f);

            classHourNumber += subjectClassHourNumber;
        }
    }

    //Fill the subjects locations
    for (auto& subject : subjects)
    {
        subject.SetLocations(subjectLocations[subject.GetName()]);
    }

    //Change fake subjects in the classHours
    for (auto& classHour : classHours) {
        classHour.ChangeSubjectLocations(subjectLocations[classHour.GetSubject().GetName()]);
    }

    /*std::cout << "Subjects: " << std::endl;
    for (auto subject : subjects) {
        std::cout << subject.GetName() << " Locations: ";
        for (auto location : subject.GetLocations()) {
            std::cout << location.GetName() << " ";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Classes: " << std::endl;
    for (auto classs : classes) {
        std::cout << classs.GetName() << " " << classs.location << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Locations: " << std::endl;
    for (auto location : locations) {
        std::cout << location.GetName() << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Teachers: " << std::endl;
    for (auto teacher : teachers) {
        std::cout << teacher.GetName() << std::endl;
    }
    std::cout << std::endl;

    std::cout << "Class Hours: " << std::endl;
    for (auto classHour : classHours) {
        std::cout << classHour.number << " " << classHour.classs.name << " " << classHour.subject.name << " " << classHour.teacher.name << std::endl;
    }
    std::cout << std::endl;*/

    WriteCatalog(classes, subjects, locations, teachers, classHours);
}

std::unordered_map<std::string, int> InputDataGenerator::SetInitialSubjectLocationNumbers()
{
    std::unordered_map<std::string, int> subjectLocationNumbers;

    for (auto& subject : m_allSubjects)
    {
        if (SubjectHasLocation(subject))
        {
            subjectLocationNumbers[subject] = 1;
        }
    }

    return subjectLocationNumbers;
}

std::unordered_map<std::string, int> InputDataGenerator::SetInitialSubjectTeacherNumbers()
{
    std::unordered_map<std::string, int> subjectTeacherNumbers;

    for (auto& subject : m_allSubjects)
    {
        subjectTeacherNumbers[subject] = 1;
    }

    return subjectTeacherNumbers;
}

Subject InputDataGenerator::GetUnusedSubject(const std::unordered_set<std::string>& usedSubjects, const std::vector<Subject>& p_subjects)
{
    std::string subjectName = m_allSubjects[Random::GetInt(0, m_allSubjects.size() - 1)];
    while (usedSubjects.count(subjectName)) {
        subjectName = m_allSubjects[Random::GetInt(0, m_allSubjects.size() - 1)];
    }

    Subject foundSubject("");
    for (auto subject : p_subjects) {
        if (subject.GetName() == subjectName)
        {
            foundSubject = subject;
        }
    }

    return foundSubject;
}

bool InputDataGenerator::SubjectHasLocation(std::string subject)
{
    return m_subjectsHasLocation[subject];
}

void InputDataGenerator::WriteCatalog(std::vector<Class> p_classes, std::vector<Subject> p_subjects, std::vector<Location> p_locations, std::vector<Teacher> p_teachers, std::vector<ClassHour> p_classHours)
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