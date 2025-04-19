cmake_minimum_required(VERSION 3.10)

# Project name
project(TimetableGenerator)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add source files
set(SOURCES
    Catalog.cpp
    Class.cpp
    ClassHour.cpp
    Database.cpp
    Random.cpp
    Location.cpp
    stdafx.cpp
    Subject.cpp
    Teacher.cpp
    TimetableConfig.cpp
    TimetableGenerator.cpp
)

# Add header files
set(HEADERS
    Catalog.h
    Class.h
    ClassHour.h
    Database.h
    Entity.h
    EntityWithCatalog.h
    EntityWithName.h
    Random.h
    Location.h
    stdafx.h
    Subject.h
    Teacher.h
    MyTime.h
    TimetableConfig.h
    TimetableGenerator.h
)

# Define the output directories for the libraries
set(LIBRARY_OUTPUT_PATH ../lib)
set(EXECUTABLE_OUTPUT_PATH ../bin)

# Add the path to nlohmann/json.hpp
include_directories(../lib)

# Add include directories
#include_directories(${PROJECT_INCLUDE_DIR})

# Define a target for the static library
add_library(TimetableGenerator STATIC ${SOURCES} ${HEADERS})

# Set the configuration-specific settings
# if(MSVC)
#     set_target_properties(TimetableGenerator PROPERTIES
#         COMPILE_FLAGS "/Zc:wchar_t"
#     )
# endif()

# Set the platform-specific library options
if(CMAKE_SIZEOF_VOID_P EQUAL 8)  # x64
    target_compile_options(TimetableGenerator PRIVATE "/D_WINDOWS_64BIT")
elseif(CMAKE_SIZEOF_VOID_P EQUAL 4)  # Win32
    target_compile_options(TimetableGenerator PRIVATE "/D_WINDOWS_32BIT")
endif()

# Add a precompiled header for the selected configuration
target_precompile_headers(TimetableGenerator PRIVATE stdafx.h)

# Install target
install(TARGETS TimetableGenerator DESTINATION lib)

# Optional: Define custom commands for packaging the source and binary
# This can be added if you want to automate packaging
# install(DIRECTORY ${PROJECT_SRC_DIR} DESTINATION include)
# install(FILES ${PROJECT_SRC_DIR}/input.txt ${PROJECT_SRC_DIR}/input.json DESTINATION share/timetable-generator)
