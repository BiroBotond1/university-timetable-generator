#include "stdafx.h"
#include "Teacher.h"

 json Teacher::GetJson() const
 {
    json res;
    res["_id"] = m_id;
    res["name"] = m_name;
    res["inappropriateDates"] = m_inappropriateDates;
    return res;
}