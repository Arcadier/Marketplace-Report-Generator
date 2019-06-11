// function to convert month specific data into cumulative data when a year and month are input
function convertMonthSpecificToCumulative(monthSpecificData) {
    var netTotal = 0;
    var cumulativeJson = {}
    for (year in monthSpecificData) {
        cumulativeJson[year] = {};
        for (month in monthSpecificData[year]) {
            // console.log("year", year, "month", month, "net total", netTotal);
            netTotal = netTotal + monthSpecificData[year][month]['count'];
            cumulativeJson[year][month] = {};
            cumulativeJson[year][month]['count'] = netTotal;
        }
    }
    return cumulativeJson;
}

// function to retrieve data from custom field and convert it into displayable form
function retData(metricsArray) {
    temp = retrieveCfListJson(metricsArray);
    // console.log("temp", temp)
    var dataJSON = {};
    for (i = 0; i < temp.length; i++) {
        if (temp[i]) {
            dataJSON[metricsArray[i]] = temp[i].Values[0];
        }
    }
    // console.log("datajson", dataJSON);
    // dataJSON = metricsArray;
    var megaData = {};
    for (key in dataJSON) {
        // console.log('key', key);
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
    // console.log(megaData);
    return megaData;
}

// return data to be displayed
function retDisplayData(megaData, sMonth, sYear, eMonth, eYear) {
    var month = sMonth;
    var year = sYear;
    var formatJSON = {};
    console.log(sYear < eYear || (sYear == eYear && sMonth < eMonth));
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
                // console.log(currObj);
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
    console.log(formatJSON);
    return formatJSON;
}


// TODO: change all your functions to work with current time and changes data from previous month till now

// retrieving data from user details API and processing it into required form:: Parameters: records- records of the user records, metricsArray - list of user data to be extracted
function retUserData(records, metricsArray = ["User", "Merchant"]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {}
    }

    for (i = 0; i < records.length; i++) {
        dt = new Date(records[i]["DateJoined"] * 1000);
        for (key in monthWise) {
            monthInner = {}
            for (j = 0; j < 12; j++) {
                // monthInner[j] = { "User": 0, "Merchant": 0 };
                monthInner[j] = { "count": 0 };
            }
            if (!monthWise[key][dt.getUTCFullYear()]) {
                monthWise[key][dt.getUTCFullYear()] = Object.assign({}, monthInner);
            }
        }
        // console.log(monthWise);
        for (j = 0; j < records[i]["Roles"].length; j++) {
            if (monthWise[records[i]["Roles"][j]]) {
                monthWise[records[i]["Roles"][j]][dt.getUTCFullYear()][dt.getUTCMonth()]["count"] += 1;
            }
        }
    }
    // console.log(monthWise);
    return monthWise;
}

// retrieving data from transaction history API and processing it into required form :: Parameters: transaction records- records of the transaction history records, metricsArray - list of metrics which need to be counted
function retTransactionData(transactionRecords, metricsArray = ['GMV', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold']) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }
    // console.log(monthWise);
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
        // console.log(monthWise);
        if (monthWise['GMV']) {
            monthWise['GMV'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += transactionRecords[i].Total / transactionRecords[i]["Orders"][0]["PaymentDetails"].length;
        }
        if (monthWise['totalFee']) {
            monthWise['totalFee'][dt.getUTCFullYear()][dt.getUTCMonth()]['count'] += transactionRecords[i]["Fee"] / transactionRecords[i]["Orders"][0]["PaymentDetails"].length;
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
    // console.log(monthWise);
    return monthWise
}


// TODO: to be worked on in a later stage
// function to store number of items which are in and out of stock input- the records obtained from response of API call to Order history and more
function storeItemStock(records) {
}

// TODO: write a function to automate all the storing 
function storageAutomation(metricsArray, transactionRecords, userRecords) {
    existingData = retrieveCfListJson(metricsArray);
    currentData1 = [];
    currentData2 = [];
    name1 = [];
    name2 = [];
    console.log(existingData);
    for (i = 0; i < metricsArray.length; i++) {
        if (['GMV', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold'].includes(metricsArray[i])) {
            name1.push(metricsArray[i]);
            currentData1.push(existingData[i]);

        }
        if (["User", "Merchant"].includes(metricsArray[i])) {
            name2.push(metricsArray[i]);
            currentData2.push(existingData[i]);

        }
    }

    processedData1 = retTransactionData(transactionRecords, name1);
    processedData2 = retUserData(userRecords, name2);
    console.log("Name", name1, name2);
    console.log("processedData", processedData1, processedData2);

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

}

function updateMetricsTime() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxStatus[i] = checkBoxes[i].childNodes[1].checked;
    }
    toastr.success("success", "Settings saved");
    extra = [];
    for (i = 0; i < checkBoxStatus.length; i++) {
        if (checkBoxStatus[i]) {
            extra.push(optionalMetrics[i]);
        }
    }
    console.log("retData parameters", parameterList.concat(extra))
    unformattedJSON = retData(parameterList.concat(extra));
    console.log(unformattedJSON);
    formattedJSON = retDisplayData(unformattedJSON, startMonthTime, startYearTime, endMonthTime, endYearTime);
    console.log("update front end called");
    updateFrontEnd(formattedJSON, 'TimeTable');
}

function setCheckBoxValues() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].childNodes[1].checked = checkBoxStatus[i];
    }
}

// Global Variables used in the program
// 
var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var CORS = "cors-anywhere.herokuapp.com/";
CORS = "";
var metrics = ["User", "Merchant", 'GMV', 'totalFee', 'Orders', 'itemsRefunded', 'itemsSold',
    'merchantBuyerRatio', 'averageRevenueMerchant', 'averageFeeMerchant'] //TODO: functions for this line have to be implmented
var optionalMetrics = ["Orders", "itemsSold", "itemsRefunded"]
// functions to help in the building of the market place report generator
// 


// getting cookie from the browser
function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}


// function to create a new custom field in implementations parameters- name of custom field(string) , data to be stored(string) , current custom field 
function createCfImplementations(cfName, storedData, cf) {
    var baseUrl = document.location.hostname;
    var adminID = document.getElementById("userGuid").value;
    var admintoken = getCookie('webapitoken');

    // POST request to change the custom field if it exists
    if (cf) {
        // console.log("entered if", "POST marketplace");
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
            // console.log(response);
        });
        // console.log("done");

    }

    else {

        // POST request to create a new custom field
        // console.log("entered else", "POST custom field");
        data = {
            "Name": cfName,
            "IsMandatory": true,
            "DataInputType": "textfield",
            "ReferenceTable": "Implementations",
            "DataFieldType": "string"
        }
        // console.log("data", data);
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
        // console.log("settings2", settings2)

        $.ajax(settings2).done(function (response) {
            // console.log(response);
            cf = response;
        });
        // console.log("done");
        // console.log("cf", cf);
        // POST request to update the custom field after creation
        // console.log("POST marketplace");
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
            // console.log(response);
        });
        // console.log("done");
    }

}


// function to create a new custom field in implementations parameters- name of custom field(string) , data to be stored(JSON) , current custom field 
function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
    createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
}


// retrieve the custom field information from the implementations table parameters- name of custom field(string) 
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
    // baseUrl = 'forgottentoy.test.arcadier.io'
    var adminToken = getCookie('webapitoken');
    // adminToken = "LHPQ0kupR4MYBYEY78OA3bHXsgzxmfCEWkEUO9qvtTRplDJgWaflW5ruDDzb3lXvtjJBcVDMsjD8Lf5EjYSwXY81QLIztONuVUDINyxhRF0BY5WBXAZ9XTP-Sgq43FJu5n77XIztvWd3DcrQUthEvTK0vnPttbEV8E7LGEYsrf4Y_PyqKn3PvYQztPzoq-AvOvwbtSI4NoUIX13LK_hyXYIcCT3aj6smFeUtoPyts30Cf-mvBLwrHmc7DE5ltB9OIX-DU_jHOrdPfSG9i4BvJ8tp_HhVu3vCPkMzvHRTpksPqMWL39mbNA3z5S4vvuP_2yzQ5oAm384tU_Bl0BIEQulTxqe66lHU-Nbiql4LU_kT7VPAP6INJiHrnG8Vg97Ly8JaWvvuVVhCyME378Ht_9ViLZjU4Pzu6Fh6Cm0VJhLhJjviqFI7GzWzccHI64QhU7QYqX8kmWlSAJ02_Q90Kx11ST9EvUXIssgr7P6jfMN6I1InDTGjpqoTXHozO_IT10rqcf6FWnnJc7IgUpdSDZuEjH_hUu5chGZutzXQyAg7ocQTdlpHP--FH_r47XL3YCTpJRmKK8bcngld-oXqFIWQlANpIh_qlUEKM1eHbKdI3LYnSD12-mdjby8D8C48gxzHfcuQA8JX-nybveierA_rcByiibzOvFFPYYqvDrLEuV-T2-zU8tGgQyHjtP77NT9-bNmA_78yupvrWn2oBhRFr4yY1g1j6NKVjWZp5H2bM4MojHaPnxHK5l3C-VpHastBGoHORgKJBduTsIrV7_6gpX06CrMLctCMBBWSTVC4g-y1XIr9Z5Ws9jyNMBw3hpuTs4nipcvCKSfVJOZ-uWXv8JC1PTsj6dClgF1jC1YluVpD";
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
        // console.log(response);
        mpCustomFields = response.CustomFields;
    })
    // console.log("marketplace customfields", mpCustomFields)

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
            // console.log(JSON.parse(cf[i].Values[0]));
            cf[i].Values[0] = JSON.parse(cf[i].Values[0]);
        }
    }

    // console.log(cf);
    return cf;
}

// functions to call APIs and return records
// 


// get records of transaction history
// function to call the API to get a list of all transaction details and return the records of the response
function getRecordsTransactionHistory() {
    adminID = document.getElementById("userGuid").value;
    // adminToken = "LHPQ0kupR4MYBYEY78OA3bHXsgzxmfCEWkEUO9qvtTRplDJgWaflW5ruDDzb3lXvtjJBcVDMsjD8Lf5EjYSwXY81QLIztONuVUDINyxhRF0BY5WBXAZ9XTP-Sgq43FJu5n77XIztvWd3DcrQUthEvTK0vnPttbEV8E7LGEYsrf4Y_PyqKn3PvYQztPzoq-AvOvwbtSI4NoUIX13LK_hyXYIcCT3aj6smFeUtoPyts30Cf-mvBLwrHmc7DE5ltB9OIX-DU_jHOrdPfSG9i4BvJ8tp_HhVu3vCPkMzvHRTpksPqMWL39mbNA3z5S4vvuP_2yzQ5oAm384tU_Bl0BIEQulTxqe66lHU-Nbiql4LU_kT7VPAP6INJiHrnG8Vg97Ly8JaWvvuVVhCyME378Ht_9ViLZjU4Pzu6Fh6Cm0VJhLhJjviqFI7GzWzccHI64QhU7QYqX8kmWlSAJ02_Q90Kx11ST9EvUXIssgr7P6jfMN6I1InDTGjpqoTXHozO_IT10rqcf6FWnnJc7IgUpdSDZuEjH_hUu5chGZutzXQyAg7ocQTdlpHP--FH_r47XL3YCTpJRmKK8bcngld-oXqFIWQlANpIh_qlUEKM1eHbKdI3LYnSD12-mdjby8D8C48gxzHfcuQA8JX-nybveierA_rcByiibzOvFFPYYqvDrLEuV-T2-zU8tGgQyHjtP77NT9-bNmA_78yupvrWn2oBhRFr4yY1g1j6NKVjWZp5H2bM4MojHaPnxHK5l3C-VpHastBGoHORgKJBduTsIrV7_6gpX06CrMLctCMBBWSTVC4g-y1XIr9Z5Ws9jyNMBw3hpuTs4nipcvCKSfVJOZ-uWXv8JC1PTsj6dClgF1jC1YluVpD";
    // baseURL = "forgottentoy.test.arcadier.io"
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


// get records of item details
// function to call the API to get a list of all item details and return the records of the response
function getRecordsItemDetails() {
    adminID = document.getElementById("userGuid").value;
    // adminToken = "LHPQ0kupR4MYBYEY78OA3bHXsgzxmfCEWkEUO9qvtTRplDJgWaflW5ruDDzb3lXvtjJBcVDMsjD8Lf5EjYSwXY81QLIztONuVUDINyxhRF0BY5WBXAZ9XTP-Sgq43FJu5n77XIztvWd3DcrQUthEvTK0vnPttbEV8E7LGEYsrf4Y_PyqKn3PvYQztPzoq-AvOvwbtSI4NoUIX13LK_hyXYIcCT3aj6smFeUtoPyts30Cf-mvBLwrHmc7DE5ltB9OIX-DU_jHOrdPfSG9i4BvJ8tp_HhVu3vCPkMzvHRTpksPqMWL39mbNA3z5S4vvuP_2yzQ5oAm384tU_Bl0BIEQulTxqe66lHU-Nbiql4LU_kT7VPAP6INJiHrnG8Vg97Ly8JaWvvuVVhCyME378Ht_9ViLZjU4Pzu6Fh6Cm0VJhLhJjviqFI7GzWzccHI64QhU7QYqX8kmWlSAJ02_Q90Kx11ST9EvUXIssgr7P6jfMN6I1InDTGjpqoTXHozO_IT10rqcf6FWnnJc7IgUpdSDZuEjH_hUu5chGZutzXQyAg7ocQTdlpHP--FH_r47XL3YCTpJRmKK8bcngld-oXqFIWQlANpIh_qlUEKM1eHbKdI3LYnSD12-mdjby8D8C48gxzHfcuQA8JX-nybveierA_rcByiibzOvFFPYYqvDrLEuV-T2-zU8tGgQyHjtP77NT9-bNmA_78yupvrWn2oBhRFr4yY1g1j6NKVjWZp5H2bM4MojHaPnxHK5l3C-VpHastBGoHORgKJBduTsIrV7_6gpX06CrMLctCMBBWSTVC4g-y1XIr9Z5Ws9jyNMBw3hpuTs4nipcvCKSfVJOZ-uWXv8JC1PTsj6dClgF1jC1YluVpD";
    // baseURL = "forgottentoy.test"

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
        // console.log(response);
    });
    return transactionRecords;
}

// get records of user data
// function to call the API to get a list of all user data and return the records of the response
function getRecordsUserDetails() {

    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    adminID = document.getElementById("userGuid").value;
    // adminToken = "LHPQ0kupR4MYBYEY78OA3bHXsgzxmfCEWkEUO9qvtTRplDJgWaflW5ruDDzb3lXvtjJBcVDMsjD8Lf5EjYSwXY81QLIztONuVUDINyxhRF0BY5WBXAZ9XTP-Sgq43FJu5n77XIztvWd3DcrQUthEvTK0vnPttbEV8E7LGEYsrf4Y_PyqKn3PvYQztPzoq-AvOvwbtSI4NoUIX13LK_hyXYIcCT3aj6smFeUtoPyts30Cf-mvBLwrHmc7DE5ltB9OIX-DU_jHOrdPfSG9i4BvJ8tp_HhVu3vCPkMzvHRTpksPqMWL39mbNA3z5S4vvuP_2yzQ5oAm384tU_Bl0BIEQulTxqe66lHU-Nbiql4LU_kT7VPAP6INJiHrnG8Vg97Ly8JaWvvuVVhCyME378Ht_9ViLZjU4Pzu6Fh6Cm0VJhLhJjviqFI7GzWzccHI64QhU7QYqX8kmWlSAJ02_Q90Kx11ST9EvUXIssgr7P6jfMN6I1InDTGjpqoTXHozO_IT10rqcf6FWnnJc7IgUpdSDZuEjH_hUu5chGZutzXQyAg7ocQTdlpHP--FH_r47XL3YCTpJRmKK8bcngld-oXqFIWQlANpIh_qlUEKM1eHbKdI3LYnSD12-mdjby8D8C48gxzHfcuQA8JX-nybveierA_rcByiibzOvFFPYYqvDrLEuV-T2-zU8tGgQyHjtP77NT9-bNmA_78yupvrWn2oBhRFr4yY1g1j6NKVjWZp5H2bM4MojHaPnxHK5l3C-VpHastBGoHORgKJBduTsIrV7_6gpX06CrMLctCMBBWSTVC4g-y1XIr9Z5Ws9jyNMBw3hpuTs4nipcvCKSfVJOZ-uWXv8JC1PTsj6dClgF1jC1YluVpD";
    // baseURL = "forgottentoy.test.arcadier.io";
    var records;

    // retrieve User Data using the API
    var settings = {
        "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + adminToken
        },
    };

    var pageSize;
    // set Data to records
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
