#include "stdafx.h"
#include "Subject.h"

json Subject::GetJson() 
{
    json res;
    res["_id"] = m_id;
    res["name"] = m_name;
    std::vector<json> jsonLocations;
    for (auto location : m_locations)
    {
        jsonLocations.push_back(location.GetJson());
    }
    res["locations"] = jsonLocations;

    return res;
}