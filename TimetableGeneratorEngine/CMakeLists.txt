cmake_minimum_required(VERSION 3.15)

# Set the solution name (this will be the name of the generated solution)
project(TimetableGeneratorSolution)

# The server needs gRPC and protobuf installed; the solver and its tests only need a compiler
option(TIMETABLE_BUILD_SERVER "Build GeneratorServer (needs gRPC and protobuf)" ON)

enable_testing()

# Add subdirectories (projects)
add_subdirectory(TimetableGenerator)
add_subdirectory(InputDataGenerator)
if(TIMETABLE_BUILD_SERVER)
    add_subdirectory(GeneratorServer)
endif()
add_subdirectory(TimetableGeneratorExe)
add_subdirectory(TimetableGeneratorTests)
