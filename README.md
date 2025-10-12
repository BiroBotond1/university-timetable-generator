# university-timetable-generator

This web application enables schools to automatically generate optimized timetables based on inputs such as teachers, classes, subjects, classrooms, and lessons, all while respecting various constraints.

## ✨ Features

- Manage teachers, classrooms, subjects, classes, and lessons
- Input validation and persistent storage
- Optimized timetable generation using a C++ computation engine
- Timetable viewer in the frontend

## 🛠️ Technologies Used

- **Frontend**: Vue 3 + Vuetify
- **Backend**: Node.js (Express)
- **Computation Engine**: C++ (CMake-based)
- **Database**: MongoDB

## ✅ Prerequisites

- **Node.js** (version 23 or higher recommended)  
  Download from: https://nodejs.org/
  
- **CMake** (version 3.10 or higher)  
  Required to configure the build process.  
  https://cmake.org/download/
  
## 🚀 How to Run the Application

### Step 1: Start the WebApplication

```bash
cd TimetableGenerator
yarn      
yarn deps:up     
yarn start
```

### Step 2: Start the C++ server

```bash
cd TimetableGeneratorEngine
mkdir "cmake/build"
cd "cmake/build"
cmake -DCMAKE_INSTALL_PREFIX=CUSTOM_LOCATION ../..
cmake --build . --config Release -j4
timetable_generator.exe 
```
- You can also open the project in your preferred C++ IDE (like CLion or Visual Studio) to run it.