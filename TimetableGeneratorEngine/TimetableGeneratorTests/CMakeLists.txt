cmake_minimum_required(VERSION 3.15)

project(TimetableGeneratorTests)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(TimetableGeneratorTests tests.cpp School.h)

target_include_directories(TimetableGeneratorTests PRIVATE
    ../lib
    ../TimetableGenerator
)

target_link_libraries(TimetableGeneratorTests TimetableGenerator)

# One CTest entry per case, each run as `TimetableGeneratorTests <case>`, so a case that hangs
# fails on its own timeout instead of stalling the rest. Keep in step with TEST_CASES in tests.cpp;
# a name missing there fails as an unknown case.
set(TEST_CASES
    class_over_week
    teacher_over_week
    room_over_booked
    no_class_hours
    valid_school
    class_without_hours
    only_fits_in_order
)

foreach(test_case IN LISTS TEST_CASES)
    add_test(NAME ${test_case} COMMAND TimetableGeneratorTests ${test_case})
    set_tests_properties(${test_case} PROPERTIES TIMEOUT 120)
endforeach()
