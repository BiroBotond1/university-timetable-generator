#include "stdafx.h"
#include "Class.h"

json Class::GetJson() const
{
    json res;
    res["_id"] = m_id;
    res["name"] = m_name;
    res["location"] = m_location;
    return res;
}