cmake_minimum_required(VERSION 3.10)

# Project name
project(TimetableGeneratorExe)

# Set the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Define source files for the executable
set(SOURCES
    main.cpp
    stdafx.cpp
)

# Define header files
set(HEADERS
    stdafx.h
)

# Include the directories for the TimetableGeneratorEngine and TimetableGenerator library
include_directories(
    ../lib
    ../TimetableGenerator
)

# Add the executable target
add_executable(TimetableGeneratorExe ${SOURCES} ${HEADERS})

# Link to the TimetableGenerator library
# Make sure the TimetableGenerator library is already built and findable
#add_subdirectory(../TimetableGenerator ${CMAKE_BINARY_DIR}/TimetableGenerator)

# Link the executable with TimetableGenerator (DLL or static library)
target_link_libraries(TimetableGeneratorExe TimetableGenerator)

# Set platform-specific flags based on the architecture (Win32 or x64)
if(CMAKE_SIZEOF_VOID_P EQUAL 8)  # x64
    target_compile_definitions(TimetableGeneratorExe PRIVATE _WIN64)
    set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR}/bin/x64)
elseif(CMAKE_SIZEOF_VOID_P EQUAL 4)  # Win32
    target_compile_definitions(TimetableGeneratorExe PRIVATE _WIN32)
    set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_BINARY_DIR}/bin/Win32)
endif()

# Set build configurations (Debug/Release)
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -g")
    target_compile_definitions(TimetableGeneratorExe PRIVATE _DEBUG)
elseif(CMAKE_BUILD_TYPE STREQUAL "Release")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2")
    target_compile_definitions(TimetableGeneratorExe PRIVATE NDEBUG)
endif()

# Optional: Set precompiled header usage for x64 Debug configuration
if(CMAKE_SIZEOF_VOID_P EQUAL 8 AND CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_precompile_headers(TimetableGeneratorExe PRIVATE stdafx.h)
endif()

# Define output directories for the executable and libraries
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/bin)
set(LIBRARY_OUTPUT_PATH ${PROJECT_BINARY_DIR}/lib)

# Install the executable to the bin directory
install(TARGETS TimetableGeneratorExe DESTINATION bin)
