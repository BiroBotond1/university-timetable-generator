cmake_minimum_required(VERSION 3.15)

project(InputDataGenerator)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include_directories(../lib)

# Add source files
set(SOURCES
    main.cpp
    Class.cpp
    ClassHour.cpp
    Entity.cpp
    InputDataGenerator.cpp
    Location.cpp
    Random.cpp
    Subject.cpp
    Teacher.cpp
    stdafx.cpp
)

set(HEADERS
  Class.h
  ClassHour.h
  Entity.h
  InputDataGenerator.h
  Location.h
  Random.h
  Subject.h
  Teacher.h
  stdafx.h
)

# Create the executable
add_executable(InputDataGenerator ${SOURCES} ${HEADERS})

target_precompile_headers(InputDataGenerator PRIVATE stdafx.h)