// file not needed just for referrence

baseURL = window.location.hostname;
adminID = document.getElementById("userGuid").value;
adminToken = getCookie("webapitoken");

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

var settings = {
    "url": "https://" + baseURL + ".arcadier.io/api/v2/users/" + adminID,
    "method": "GET",
    "timeout": 0,
    "headers": {
        "Authorization": "Bearer " + adminToken
    }
};

$.ajax(settings).done(function (response) {
    userRecords = response.Records;
});

function sortByMonth(userRecords) {
    monthWise = {};
    monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthData = {};
    for (i = 0; i < 12; i++) {
        monthData[i] = {}
    }
    for (i = 0; i < userRecords.length; i++) {
        // console.log(userRecords[i].DateJoined)
        dateJoined = new Date(userRecords[i]["DateJoined"] * 1000);
        //         console.log(dateJoined);
        var clone = Object.assign({}, userRecords[i]);
        delete clone["DateJoined"];
        if (!monthWise[dateJoined.getUTCFullYear()]) {
            monthWise[dateJoined.getUTCFullYear()] = {}
        }

        if (!monthWise[dateJoined.getUTCFullYear()][dateJoined.getUTCMonth()]) {
            monthWise[dateJoined.getUTCFullYear()][dateJoined.getUTCMonth()] = [clone];
        }
        else {
            monthWise[dateJoined.getUTCFullYear()][dateJoined.getUTCMonth()].push(clone);
        }

    }
    return monthWise;

}

dataByYearMonth = sortByMonth(userRecords);

function totalNumberOfUser(sortedData, userType, Date) {
    count = 0;
    console.log(sortedData);

    for (var year in sortedData) {
        console.log(year, sortedData[year], Date.getUTCFullYear(), Date.getUTCMonth());
        if (Number(year) > Date.getUTCFullYear()) {
            break;
        }
        else if (Number(year) < Date.getUTCFullYear()) {
            for (var month in sortedData[year]) {
                for (var user in sortedData[year][month]) {
                    if (sortedData[year][month][user]["Roles"].includes(userType)) {
                        count = count + 1;
                    }
                }
            }
        }
        else if (Number(year) == Date.getUTCFullYear()) {
            for (var month in sortedData[year]) {
                if (Number(month) > sortedData[year]) {
                    break;
                }
                else {
                    for (var user in sortedData[year][month]) {
                        if (sortedData[year][month][user]["Roles"].includes(userType)) {
                            count = count + 1;
                        }
                    }
                }
            }
        }
    }
    return count;
}

function monthSpecific(year, userType, month = false) {
    tableData = {};
    temp = dataByYearMonth[year];
    if (monthArray[month]) {
        console.log("if");
        tableData[month.toString() + "-" + year.toString()] = {
            "Month": monthArray[month],
            "Users Registered": 0
        };
        for (userKey in temp[month]) {
            if (temp[monthKey][userKey]["Roles"].includes(userType)) {
                tableData[month.toString() + "-" + year.toString()]["Users Registered"] += 1;
            }
        }
    }
    else {
        console.log("else");
        for (monthKey = 0; monthKey < 12; monthKey) {
            tableData[monthKey.toString() + "-" + year.toString()] = {
                "Month": monthArray[monthKey],
                "Users Registered": 0
            };
            for (userKey in temp[monthKey]) {
                if (temp[monthKey][userKey]["Roles"].includes(userType)) {
                    tableData[monthKey.toString() + "-" + year.toString()]["Users Registered"] += 1;
                }
            }

        }
    }
    return tableData;
}

function monthCumulative(year, userType, month = false) {
    tableData = {};
    if (monthArray[month]) {
        tableData = totalNumberOfUser(dataByYearMonth, userType, new Date(monthArray[month] + ' 1, ' + year.toString() + ' 00:00:00'));
        // var date1 = new Date('December 17, 1995 03:24:00');

    }
}
