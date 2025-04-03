#include "stdafx.h"
#include "Entity.h"

std::string Entity::GenerateMongoObjectId()
{
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