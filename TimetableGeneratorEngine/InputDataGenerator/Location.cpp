#include "stdafx.h"
#include "Location.h"

json Location::GetJson()
{
    json res;
    res["_id"] = m_id;
    res["name"] = m_name;
    res["reservedDates"] = m_reservedDates;
    return res;
}