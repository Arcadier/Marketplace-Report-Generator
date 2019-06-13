// Global Variables used in the program
// 
var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// var CORS = "cors-anywhere.herokuapp.com/";
var CORS = "";
var metrics = ["User", "Merchant", 'GrossMerchandiseValue', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold', "Merchant-Buyer-Ratio", "Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant"];
var optionalMetrics = ["Orders", "itemsSold", "itemsRefunded", "Merchant-Buyer-Ratio", "Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant"];
var checkBoxStatus = [];
var parameterList = ["User", "Merchant", "GrossMerchandiseValue", "totalFee"];
var extra = [];
var unformattedJSON;
var unformattedJSONcum;
var startMonthTime = false;
var startYearTime = false;
var currDay = new Date();
var endMonthTime = currDay.getMonth();
var endYearTime = currDay.getFullYear();
var formattedJSON;
var currentDataTime = 0;
var startYearMarket;
var startMonthMarket;
var dateCumMonth = false;
var dateCumYear = false;

// functions to help in the building of the market place report generator
// 

// function to convert month specific data into cumulative data when a year and month are input
function convertMonthSpecificToCumulative(monthSpecificData) {
    var netTotal = 0;
    var cumulativeJson = {}
    for (year in monthSpecificData) {
        cumulativeJson[year] = {};
        for (month in monthSpecificData[year]) {
            netTotal = netTotal + monthSpecificData[year][month]['count'];
            cumulativeJson[year][month] = { 'count': netTotal };
            cumulativeJson[year][month]['count'] = Math.round(cumulativeJson[year][month]['count'] * 100) / 100;
        }
    }
    return cumulativeJson;
}

// function to retrieve data from custom field and convert it into displayable form
function retData(metricsArray, dataPassed = true) {
    var dataJSON = {};
    if (dataPassed) {
        temp = retrieveCfListJson(metricsArray);
        for (i = 0; i < temp.length; i++) {
            if (temp[i]) {
                dataJSON[metricsArray[i]] = temp[i].Values[0];
            }
        }
    } else {
        dataJSON = metricsArray;
    }

    var megaData = {};
    for (key in dataJSON) {
        for (year in dataJSON[key]) {
            if (!megaData[year]) {
                megaData[year] = {};
            }
            for (month in dataJSON[key][year]) {

                if (!megaData[year][month]) {
                    megaData[year][month] = {};
                }
                if (!megaData[year][month]['time']) {
                    megaData[year][month]['time'] = year.toString() + "-" + month.toString();
                }
                megaData[year][month][key] = dataJSON[key][year][month]['count'];
            }
        }
    }
    return megaData;
}

// return data to be displayed
function retDisplayData(megaData, sMonth, sYear, eMonth, eYear) {
    var month = sMonth;
    var year = sYear;
    var formatJSON = {};
    if (sYear < eYear || sYear == eYear && sMonth <= eMonth) {
        while (true) {
            if (year != sYear) {
                month = 0;
            }

            while (true) {
                if (year == eYear && month > eMonth) {
                    break;
                }
                currObj = megaData[year][month]['time'];
                formatJSON[currObj] = Object.assign({}, megaData[year][month]);
                str = formatJSON[currObj]['time'].split("-");
                formatJSON[currObj]['time'] = str[0] + " " + monthArray[str[1]];
                month++;
                if (month > 11) {
                    break;
                }

            }
            year++;
            if (year > eYear) {
                break;
            }
        }
    }
    return formatJSON;
}


// retrieving data from user details API and processing it into required form:: Parameters: records- records of the user records, metricsArray - list of user data to be extracted
function retUserData(records, metricsArray = ["User", "Merchant", "Merchant-Buyer-Ratio"]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {}
    }
    for (i = 0; i < records.length; i++) {
        dt = new Date(records[i]["DateJoined"] * 1000);
        for (key in monthWise) {
            monthInner = {}
            for (j = 0; j < 12; j++) {
                monthInner[j] = { "count": 0 };
            }
            if (!monthWise[key][dt.getUTCFullYear()]) {
                monthWise[key][dt.getUTCFullYear()] = Object.assign({}, monthInner);
            }
        }
        for (j = 0; j < records[i]["Roles"].length; j++) {
            if (monthWise[records[i]["Roles"][j]]) {
                monthWise[records[i]["Roles"][j]][dt.getUTCFullYear()][dt.getUTCMonth()]["count"] += 1;
            }
        }
    }
    if (monthWise["User"] && monthWise["Merchant"] && monthWise["Merchant-Buyer-Ratio"]) {
        for (year in monthWise['Merchant-Buyer-Ratio']) {
            for (month in monthWise['Merchant-Buyer-Ratio'][year]) {
                monthWise["Merchant-Buyer-Ratio"][year][month]['count'] = monthWise["Merchant"][year][month]['count'] / (monthWise["User"][year][month]['count'] - monthWise["Merchant"][year][month]['count']);
                if (!isNaN(monthWise["Merchant-Buyer-Ratio"][year][month]['count']) && monthWise["Merchant-Buyer-Ratio"][year][month]['count'] != Infinity) {
                    monthWise["Merchant-Buyer-Ratio"][year][month]['count'] = Math.round(monthWise["Merchant-Buyer-Ratio"][year][month]['count'] * 100) / 100;
                }
                else {
                    monthWise["Merchant-Buyer-Ratio"][year][month]['count'] = "not defined";
                }

            }
        }
    }
    return monthWise;
}

// retrieving data from transaction history API and processing it into required form :: Parameters: transaction records- records of the transaction history records, metricsArray - list of metrics which need to be counted
function retTransactionData(transactionRecords, metricsArray = ['GrossMerchandiseValue', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold']) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }
    for (i = 0; i < transactionRecords.length; i++) {
        var UTCSec = transactionRecords[i].Orders[0].PaymentDetails[0].DateTimeCreated * 1000;
        dt = new Date(UTCSec);

        for (key in monthWise) {
            var monthInner = {}
            for (j = 0; j < 12; j++) {
                monthInner[j] = { "count": 0 };
            }
            if (!monthWise[key][dt.getUTCFullYear()]) {
                monthWise[key][dt.getUTCFullYear()] = Object.assign({}, monthInner);
            }
        }
        if (monthWise['GrossMerchandiseValue']) {
            monthWise['GrossMerchandiseValue'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += transactionRecords[i].Total / transactionRecords[i]["Orders"][0]["PaymentDetails"].length;
            monthWise['GrossMerchandiseValue'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] = Math.round(monthWise['GrossMerchandiseValue'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] * 100) / 100;
        }
        if (monthWise['totalFee']) {
            monthWise['totalFee'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += transactionRecords[i]["Fee"] / transactionRecords[i]["Orders"][0]["PaymentDetails"].length;
            monthWise['totalFee'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] = Math.round(monthWise['totalFee'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] * 100) / 100;
        }
        if (monthWise['Orders']) {
            monthWise['Orders'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += transactionRecords[i].Orders.length;
        }

        for (j = 0; j < transactionRecords[i].Orders.length; j++) {
            if (monthWise['itemsSold']) {
                if (transactionRecords[i].Orders[j]['CartItemDetails']) {
                    for (k = 0; k < transactionRecords[i].Orders[j]['CartItemDetails'].length; k++) {

                        monthWise["itemsSold"][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += parseInt(transactionRecords[i].Orders[j]['CartItemDetails'][k]['Quantity']);
                    }
                }
            }
            if (monthWise['itemsRefunded']) {
                if (transactionRecords[i].Orders[j].PaymentStatus == "Refunded") {
                    monthWise["itemsRefunded"][dt.getUTCFullYear()][dt.getUTCMonth()]["count"] += 1;
                }
            }
        }
    }
    return monthWise;
}

function storageAutomation(metricsArray, transactionRecords, userRecords) {
    existingData = retrieveCfListJson(metricsArray);
    currentData1 = [];
    currentData2 = [];
    currentData3 = [];

    name1 = [];
    name2 = [];
    name3 = [];

    for (i = 0; i < metricsArray.length; i++) {
        if (['GrossMerchandiseValue', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold'].includes(metricsArray[i])) {
            name1.push(metricsArray[i]);
            currentData1.push(existingData[i]);

        }
        if (["User", "Merchant", "Merchant-Buyer-Ratio"].includes(metricsArray[i])) {
            name2.push(metricsArray[i]);
            currentData2.push(existingData[i]);

        }
        if (["Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant"].includes(metricsArray[i])) {
            name3.push(metricsArray[i]);
            currentData3.push(existingData[i]);
        }
    }

    processedData1 = retTransactionData(transactionRecords, name1);
    processedData2 = retUserData(userRecords, name2);
    processedData3 = calculateRatio(userRecords, transactionRecords, name3);


    count = 0;
    for (key in processedData1) {
        createCfImplementationsJSON(name1[count], processedData1[key], currentData1[count]);
        count++;
    }
    count = 0;
    for (key in processedData2) {
        createCfImplementationsJSON(name2[count], processedData2[key], currentData2[count]);
        count++;
    }
    count = 0;
    for (key in processedData3) {
        createCfImplementationsJSON(name3[count], processedData3[key], currentData3[count]);
        count++;
    }

}

function updateMetricsTime() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxStatus[i] = checkBoxes[i].childNodes[1].checked;
    }
    toastr.success("Success", "Settings saved");
    extra = [];
    for (i = 0; i < checkBoxStatus.length; i++) {
        if (checkBoxStatus[i]) {
            extra.push(optionalMetrics[i]);
        }
    }

    unformattedJSON = retData(parameterList.concat(extra));
    console.log(unformattedJSON);
    unformattedJSONcum = massCumulativeDataTime(parameterList.concat(extra));
    unformattedJSONcum = retData(unformattedJSONcum, false);
    if (currentDataTime == 0) {
        if (monthArray[startMonthTime]) {
            formattedJSON = retDisplayData(unformattedJSON, startMonthTime, startYearTime, endMonthTime, endYearTime);
            updateFrontEnd(formattedJSON, 'TimeTable');
        }
        else {
            resetTable(1 - currentDataTime);
            currentDataTime = 1 - currentDataTime;
        }
    }
    else if (currentDataTime == 1) {
        if (monthArray[dateCumMonth]) {
            formattedJSONcum = retDisplayData(unformattedJSONcum, startMonthMarket, startYearMarket, dateCumMonth, dateCumYear);
            updateFrontEnd(formattedJSONcum, 'TimeTable');
        }
        else {
            resetTable(1 - currentDataTime);
            currentDataTime = 1 - currentDataTime;
        }
    }
}

function setCheckBoxValues() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].childNodes[1].checked = checkBoxStatus[i];
    }
}


function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}


function createCfImplementations(cfName, storedData, cf) {
    var baseUrl = document.location.hostname;
    var adminID = document.getElementById("userGuid").value;
    var admintoken = getCookie('webapitoken');

    if (cf) {
        data = {
            "CustomFields": [
                {
                    "Code": cf.Code,
                    "Values": [
                        storedData
                    ]
                }
            ]
        }
        var settings1 = {
            "url": "https://" + baseUrl + "/api/v2/marketplaces",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "data": JSON.stringify(data),
            "async": false
        };

        $.ajax(settings1).done(function (response) {
        });

    }

    else {


        data = {
            "Name": cfName,
            "IsMandatory": true,
            "DataInputType": "textfield",
            "ReferenceTable": "Implementations",
            "DataFieldType": "string"
        }
        var settings2 = {
            "url": "https://" + baseUrl + "/api/v2/admins/" + adminID + "/custom-field-definitions",
            "method": "POST",
            "async": false,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "data": JSON.stringify(data)
        };

        $.ajax(settings2).done(function (response) {
            cf = response;
        });

        data2 = {
            "CustomFields": [
                {
                    "Code": cf.Code,
                    "Values": [
                        storedData
                    ]
                }
            ]
        }

        var settings3 = {
            "url": "https://" + baseUrl + "/api/v2/marketplaces",
            "method": "POST",
            "async": false,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "data": JSON.stringify(data2)
        };

        $.ajax(settings3).done(function (response) {
        });
    }

}

function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
    createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
}

function retrieveCfValueJSON(cfName) {
    var baseUrl = document.location.hostname;
    var admintoken = getCookie('webapitoken');

    var settings1 = {
        "url": "https://" + baseUrl + "/api/v2/marketplaces",
        "method": "GET",
        "async": false,
        "headers": {
            "authorization": "Bearer " + admintoken
        }

    }
    var mpCustomFields = []
    $.ajax(settings1).done(function (response) {
        mpCustomFields = response.CustomFields;
    })

    var cf = null;
    for (i = 0; i < mpCustomFields.length; i++) {

        if (mpCustomFields[i]["Name"] == cfName) {
            cf = mpCustomFields[i];
        }
    }
    if (cf) {
        cf.Values[0] = JSON.parse(cf.Values[0]);
        return cf;
    }
    else {
        return false;
    }
}

function retrieveCfListJson(cfNameList) {
    var baseUrl = document.location.hostname;
    var adminToken = getCookie('webapitoken');
    var settings1 = {
        "url": "https://" + CORS + baseUrl + "/api/v2/marketplaces",
        "method": "GET",
        "async": false,
        "headers": {
            "authorization": "Bearer " + adminToken
        }

    }
    var mpCustomFields = []
    $.ajax(settings1).done(function (response) {
        mpCustomFields = response.CustomFields;
    })

    var cf = [];
    for (j = 0; j < cfNameList.length; j++) {
        cf.push(false);
        for (i = 0; i < mpCustomFields.length; i++) {
            if (cfNameList[j] == (mpCustomFields[i]["Name"])) {
                cf[j] = mpCustomFields[i];
            }
        }
    }

    for (i = 0; i < cf.length; i++) {
        if (cf[i]) {
            cf[i].Values[0] = JSON.parse(cf[i].Values[0]);
        }
    }

    return cf;
}

function getRecordsTransactionHistory() {
    adminID = document.getElementById("userGuid").value;

    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    var settings = {
        "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=1&pageNumber=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        }
    };
    var pageSize;
    $.ajax(settings).done(function (response) {
        pageSize = response.TotalRecords;
    });

    var settings1 = {
        "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=" + pageSize + "&pageNumber=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        }
    };

    var transactionRecords = {};
    $.ajax(settings1).done(function (response) {
        transactionRecords = response.Records;
    });
    return transactionRecords;
}


function getRecordsItemDetails() {
    adminID = document.getElementById("userGuid").value;
    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    var settings = {
        "url": "https://" + baseURL + "/api/v2/items/?pageSize=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        }
    };

    var pageSize;
    $.ajax(settings).done(function (response) {
        pageSize = response.TotalRecords;
    });
    var settings1 = {
        "url": "https://" + baseURL + "/api/v2/items/?pageSize=" + pageSize,
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        }
    };

    var transactionRecords = {};
    $.ajax(settings1).done(function (response) {
        transactionRecords = response.Records;
    });
    return transactionRecords;
}


function getRecordsUserDetails() {

    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    adminID = document.getElementById("userGuid").value;

    var records;

    var settings = {
        "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        },
    };

    var pageSize;
    $.ajax(settings).done(function (response) {
        pageSize = response.TotalRecords;
    });
    var settings2 = {
        "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        },
    };
    var records;
    $.ajax(settings2).done(function (response) {
        records = response.Records;
    });
    return records;
}

function startOfProgramTime() {
    monthLastStored = retrieveCfValueJSON("MonthName")
    var lastDate;
    var lastYear;
    var lastMonth;
    if (monthLastStored) {
        lastDate = JSON.parse(monthLastStored.Values[0]).split("-");
        lastYear = Number(lastDate[0]);
        lastMonth = Number(lastDate[1]);
    }
    else {
        lastDate = lastYear = lastMonth = false;
    }
    if (currDay.getFullYear() != lastYear && currDay.getMonth() != lastMonth) {
        createCfImplementationsJSON("MonthName", JSON.stringify(currDay.getFullYear() + "-" + currDay.getMonth()), monthLastStored);
        storageAutomation(metrics, getRecordsTransactionHistory(), getRecordsUserDetails());
    }
    resetTable(1 - currentDataTime);
    currentDataTime = 1 - currentDataTime;
}

function retCSV(tableDataJson, tableDataJsonCum = null, bool = 0) {
    if (bool) {
        tableDataJson = tableDataJsonCum;
    }
    console.log(tableDataJson);
    if (tableDataJson) {
        var CSV = ""
        var headings = ""
        var outerKeys = Object.keys(tableDataJson);
        var headingsJSON = tableDataJson[outerKeys[0]];
        for (key in headingsJSON) {
            headings += key.toString() + ",";
        }
        headings = headings.slice(0, headings.length - 1) + "\n";

        for (key in tableDataJson) {
            for (innerKey in tableDataJson[key]) {
                CSV += "\"" + tableDataJson[key][innerKey].toString() + "\"" + ",";
            }
            CSV = CSV.slice(0, CSV.length - 1) + "\n";
        }
        CSV = headings + CSV;

        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'Report.csv';
        hiddenElement.click();
    }
    else {
        toastr.error("Error", "Please select start date and end date")
    }
}


function calculateRatio(userRecords, transactionRecords, metrics = ["Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant"]) {
    if (metrics.length > 1) {
        var monthWise = {};
        for (i = 0; i < metrics.length; i++) {
            monthWise[metrics[i]] = {};
        }

        processedUserData = convertMonthSpecificToCumulative(retUserData(userRecords, ["Merchant"])['Merchant']);
        console.log(processedUserData);
        if (monthWise["Average-Revenue-Per-Merchant"]) {
            revenue = retTransactionData(transactionRecords, ["GrossMerchandiseValue"]);

            for (year in revenue["GrossMerchandiseValue"]) {
                if (!monthWise['Average-Revenue-Per-Merchant'][year]) {
                    monthWise['Average-Revenue-Per-Merchant'][year] = {}
                }
                for (month in revenue["GrossMerchandiseValue"][year]) {
                    monthWise['Average-Revenue-Per-Merchant'][year][month] = { 'count': revenue["GrossMerchandiseValue"][year][month]['count'] / processedUserData[year][month]['count'] };
                    if (isNaN(monthWise['Average-Revenue-Per-Merchant'][year][month]['count'])) {
                        monthWise['Average-Revenue-Per-Merchant'][year][month]['count'] = "undefined";
                    }
                    else {
                        monthWise['Average-Revenue-Per-Merchant'][year][month]['count'] = Math.round(monthWise['Average-Revenue-Per-Merchant'][year][month]['count'] * 100) / 100;
                    }
                }
            }
        }

        if (monthWise["Average-Commission-Fee-Per-Merchant"]) {
            commission = retTransactionData(transactionRecords, ["totalFee"]);

            for (year in commission["totalFee"]) {
                if (!monthWise['Average-Commission-Fee-Per-Merchant'][year]) {
                    monthWise['Average-Commission-Fee-Per-Merchant'][year] = {}
                }
                for (month in commission["totalFee"][year]) {
                    monthWise['Average-Commission-Fee-Per-Merchant'][year][month] = { 'count': commission["totalFee"][year][month]['count'] / processedUserData[year][month]['count'] };
                    if (isNaN(monthWise['Average-Commission-Fee-Per-Merchant'][year][month]['count'])) {
                        monthWise['Average-Commission-Fee-Per-Merchant'][year][month]['count'] = "undefined";
                    } else {
                        monthWise['Average-Commission-Fee-Per-Merchant'][year][month]['count'] = Math.round(monthWise['Average-Commission-Fee-Per-Merchant'][year][month]['count'] * 100) / 100;
                    }
                }
            }
        }

    }
    return monthWise;
}

function resetTable(x) {
    if (currentDataTime != x) {
        headersJSON = { 'time': null };
        allParam = parameterList.concat(extra);
        for (i = 0; i < allParam.length; i++) {
            headersJSON[allParam[i]] = null;
        }
        updateFrontEnd({ 1: headersJSON }, 'TimeTable');
        currentDataTime = x;
    }
}

function massCumulativeDataTime(metrics) {
    output = {};
    nonRatio = [];
    ratio = [];
    for (i = 0; i < metrics.length; i++) {
        if (["User", "Merchant", 'GrossMerchandiseValue', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold'].includes(metrics[i])) {
            nonRatio.push(metrics[i]);
        }
        else {
            ratio.push(metrics[i]);
        }
    }

    monSpecData = retrieveCfListJson(nonRatio);
    cumDataNonRatio = {};
    for (i = 0; i < nonRatio.length; i++) {
        cumDataNonRatio[nonRatio[i]] = convertMonthSpecificToCumulative(monSpecData[i].Values[0]);
    }

    cumDataRatio = {};

    if (ratio.includes("Merchant-Buyer-Ratio")) {
        cumDataRatio['Merchant-Buyer-Ratio'] = {};
        for (year in cumDataNonRatio['Merchant']) {
            if (!cumDataRatio['Merchant-Buyer-Ratio'][year]) {
                cumDataRatio['Merchant-Buyer-Ratio'][year] = {};
            }
            for (month in cumDataNonRatio['Merchant'][year]) {

                cumDataRatio['Merchant-Buyer-Ratio'][year][month] = { "count": cumDataNonRatio['Merchant'][year][month]['count'] / (cumDataNonRatio['User'][year][month]['count'] - cumDataNonRatio['Merchant'][year][month]['count']) };
                if (!isNaN(cumDataRatio['Merchant-Buyer-Ratio'][year][month]['count']) && cumDataRatio['Merchant-Buyer-Ratio'][year][month]['count'] != Infinity) {
                    cumDataRatio['Merchant-Buyer-Ratio'][year][month]['count'] = Math.round(cumDataRatio['Merchant-Buyer-Ratio'][year][month]['count'] * 100) / 100;
                }
                else {
                    cumDataRatio['Merchant-Buyer-Ratio'][year][month]['count'] = "not defined";
                }
            }
        }
    }


    if (ratio.includes("Average-Revenue-Per-Merchant")) {
        cumDataRatio["Average-Revenue-Per-Merchant"] = {};
        if (nonRatio.includes("GrossMerchandiseValue")) {
            gmv = cumDataNonRatio['GrossMerchandiseValue'];
        }
        else {
            gmv = retrieveCfValueJSON('GrossMerchandiseValue').Values[0];

        }
        for (year in gmv) {
            if (!cumDataRatio['Average-Revenue-Per-Merchant'][year]) {
                cumDataRatio['Average-Revenue-Per-Merchant'][year] = {};
            }
            for (month in gmv[year]) {
                cumDataRatio['Average-Revenue-Per-Merchant'][year][month] = { "count": gmv[year][month]['count'] / cumDataNonRatio['Merchant'][year][month]['count'] };
                if (!isNaN(cumDataRatio['Average-Revenue-Per-Merchant'][year][month]['count']) && cumDataRatio['Average-Revenue-Per-Merchant'][year][month]['count'] != Infinity) {
                    cumDataRatio['Average-Revenue-Per-Merchant'][year][month]['count'] = Math.round(cumDataRatio['Average-Revenue-Per-Merchant'][year][month]['count'] * 100) / 100;
                }
                else {
                    cumDataRatio['Average-Revenue-Per-Merchant'][year][month]['count'] = "not defined";
                }
            }
        }
    }


    if (ratio.includes("Average-Commission-Fee-Per-Merchant")) {
        cumDataRatio["Average-Commission-Fee-Per-Merchant"] = {};
        if (nonRatio.includes("totalFee")) {
            gmv = cumDataNonRatio['totalFee'];
        }
        else {
            gmv = retrieveCfValueJSON('totalFee').Values[0];

        }
        for (year in gmv) {
            if (!cumDataRatio['Average-Commission-Fee-Per-Merchant'][year]) {
                cumDataRatio['Average-Commission-Fee-Per-Merchant'][year] = {};
            }
            for (month in gmv[year]) {
                cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month] = { "count": gmv[year][month]['count'] / cumDataNonRatio['Merchant'][year][month]['count'] };
                if (!isNaN(cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month]['count']) && cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month]['count'] != Infinity) {
                    cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month]['count'] = Math.round(cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month]['count'] * 100) / 100;
                }
                else {
                    cumDataRatio['Average-Commission-Fee-Per-Merchant'][year][month]['count'] = "not defined";
                }
            }
        }
    }

    return Object.assign(cumDataNonRatio, cumDataRatio);
}