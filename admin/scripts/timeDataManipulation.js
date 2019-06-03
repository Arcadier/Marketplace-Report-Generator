// storing the total number of users and merchants organized by the year : month : metric
function storeUserDataMonthSpecific() {
    // have to account for limited page size in everything
    monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    baseURL = window.location.hostname;
    adminID = document.getElementById("userGuid").value;
    adminToken = getCookie("webapitoken");
    var records;
    existingData = retrieveCfValueJSON('userdatamonthspecific');

    // retrieve User Data using the API
    var settings = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        },
    };

    // set Data to records
    $.ajax(settings).done(function (response) {
        records = response.Records;
        console.log(response);
    });


    monthWise = {}
    monthInner = {}
    for (i = 0; i < 12; i++) {
        monthInner[i] = { "User": 0, "Merchant": 0 };
    }

    for (i = 0; i < records.length; i++) {
        dt = new Date(records[i]["DateJoined"] * 1000);
        if (!monthWise[dt.getUTCFullYear()]) {
            monthWise[dt.getUTCFullYear()] = monthInner;
        }
        for (j = 0; j < records[i]["Roles"].length; j++) {

            if (monthArray[monthWise[dt.getUTCFullYear()][dt.getUTCMonth()][records[i]["Roles"][j]]]) {
                monthWise[dt.getUTCFullYear()][dt.getUTCMonth()][records[i]["Roles"][j]] = monthWise[dt.getUTCFullYear()][dt.getUTCMonth()][records[i]["Roles"][j]] + 1;
            }
        }
    }
    console.log(monthWise);
    createCfImplementationsJSON('userdatamonthspecific', monthWise, existingData)
}

function storeGMV() {
    baseURL = window.location.hostname;
    adminID = document.getElementById("userGuid").value;
    adminToken = getCookie("webapitoken");
    existingData = retrieveCfValueJSON('userdatamonthspecific');

    var settings = {
        "url": "https://" + baseURL + ".arcadier.io/api/v2/admins/" + adminID + "/transactions?pageSize=1&pageNumber=1",
        "method": "GET",
        "async": false
    };
    var pageSize;
    $.ajax(settings).done(function (response) {
        pageSize = response.TotalRecords;
        console.log("calling GET transaction history to get page size", response);
    });

    var settings1 = {
        "url": "https://" + baseURL + ".arcadier.io/api/v2/admins/" + adminID + "/transactions?pageSize=" + pageSize + "&pageNumber=1",
        "method": "GET",
        "async": false
    };
    var transactionRecords = {};
    $.ajax(settings1).done(function (response) {
        transactionRecords = response.Records;
        console.log("calling GET transaction history to find GMV", response);
    });
    for (i = 0; i < transactionRecords.length; i++) {
        // write the function to add in all the sold merchandise and find which time to use to categorise it
    }


}