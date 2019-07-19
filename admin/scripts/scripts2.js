// // Global Variables used in the program
//
// var metrics = ["Total-Users", "Total-Merchants", 'Gross-Merchandise-Value', 'Total-Admin-Commission', 'Total-Orders', 'Items-Refunded', 'Items-Sold', "Merchant-Buyer-Ratio", "Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant", "Guest-Registered-User-Ratio", "Total-Logins", "Average-Purchases-Per-Buyer", "Average-Order-Value"];
// var optionalMetrics = [metrics[4], metrics[6], metrics[5], metrics[7], metrics[8], metrics[9], metrics[10], metrics[11], metrics[12], metrics[13]];
// var parameterList = [metrics[0], metrics[1], metrics[2], metrics[3]];
// var checkBoxStatus = [];
// var extra = [];
// var startDateTime = false;
// var endDateTime = currDay = new Date();
// var allData;
// var timeDisplayType = "day";
// var displayData;
// var reportType;
// var metricGroupings = [
//     [metrics[0], metrics[1], metrics[7], metrics[10], metrics[11]],
//     [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]],
//     [metrics[8], metrics[9], metrics[12], metrics[13]]
// ]
// var helpDict = {
//     [metrics[0]]: "Number of users who joined",
//     [metrics[1]]: "Number of merchants who joined",
//     [metrics[2]]: "Total value made in the marketing place",
//     [metrics[3]]: "The total commision made by the admin",
//     [metrics[4]]: "Number of orders",
//     [metrics[5]]: "Total number of items refunded",
//     [metrics[6]]: "Total number of items sold",
//     [metrics[7]]: "Ratio of merchants to buyers",
//     [metrics[8]]: "The average revenue earned by a merchant",
//     [metrics[9]]: "The average commission earned by an administrator",
//     [metrics[10]]: "Ratio of purchases made by guest users to that made by registered users",
//     [metrics[11]]: "Total number of logins in a particular time perion(calculation of logins only starts after the plugin has been installed)",
//     [metrics[12]]: "The average number of purchases made by a buyer",
//     [metrics[13]]: "The average value of an order"
// }
// // ==================================================================================================================================
// // API Calls
// function getCookie(name) {
//     var value = '; ' + document.cookie;
//     var parts = value.split('; ' + name + '=');
//     if (parts.length === 2) {
//         return parts.pop().split(';').shift();
//     }
// }
//
// function getRecordsTransactionHistory() {
//     adminID = document.getElementById("userGuid").value;
//
//     baseURL = window.location.hostname;
//     adminToken = getCookie("webapitoken");
//
//     var settings = {
//         "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=1&pageNumber=1",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         }
//     };
//     var pageSize;
//     $.ajax(settings).done(function (response) {
//         pageSize = response.TotalRecords;
//     });
//
//     var settings1 = {
//         "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=" + pageSize + "&pageNumber=1",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         }
//     };
//
//     var transactionRecords = {};
//     $.ajax(settings1).done(function (response) {
//         transactionRecords = response.Records;
//     });
//     return transactionRecords;
// }
//
//
// function getRecordsItemDetails() {
//     adminID = document.getElementById("userGuid").value;
//     baseURL = window.location.hostname;
//     adminToken = getCookie("webapitoken");
//
//     var settings = {
//         "url": "https://" + baseURL + "/api/v2/items/?pageSize=1",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         }
//     };
//
//     var pageSize;
//     $.ajax(settings).done(function (response) {
//         pageSize = response.TotalRecords;
//     });
//     var settings1 = {
//         "url": "https://" + baseURL + "/api/v2/items/?pageSize=" + pageSize,
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         }
//     };
//
//     var transactionRecords = {};
//     $.ajax(settings1).done(function (response) {
//         transactionRecords = response.Records;
//     });
//     return transactionRecords;
// }
//
//
// function getRecordsUserDetails() {
//
//     baseURL = window.location.hostname;
//     adminToken = getCookie("webapitoken");
//
//     adminID = document.getElementById("userGuid").value;
//
//     var records;
//
//     var settings = {
//         "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         },
//     };
//
//     var pageSize;
//     $.ajax(settings).done(function (response) {
//         pageSize = response.TotalRecords;
//     });
//     var settings2 = {
//         "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "Authorization": "Bearer " + adminToken
//         },
//     };
//     var records;
//     $.ajax(settings2).done(function (response) {
//         records = response.Records;
//     });
//     return records;
// }
//
// // ==================================================================================================================================
// // Custom Fields
//
// function createCfImplementations(cfName, storedData, cf) {
//     var baseUrl = document.location.hostname;
//     var adminID = document.getElementById("userGuid").value;
//     var admintoken = getCookie('webapitoken');
//
//     if (cf) {
//         data = {
//             "CustomFields": [
//                 {
//                     "Code": cf.Code,
//                     "Values": [
//                         storedData
//                     ]
//                 }
//             ]
//         }
//         var settings1 = {
//             "url": "https://" + baseUrl + "/api/v2/marketplaces",
//             "method": "POST",
//             "async": false,
//             "headers": {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer " + admintoken
//             },
//             "data": JSON.stringify(data)
//         };
//
//         $.ajax(settings1);
//
//     }
//
//     else {
//         data = {
//             "Name": cfName,
//             "IsMandatory": true,
//             "DataInputType": "textfield",
//             "ReferenceTable": "Implementations",
//             "DataFieldType": "string"
//         }
//         var settings2 = {
//             "url": "https://" + baseUrl + "/api/v2/admins/" + adminID + "/custom-field-definitions",
//             "method": "POST",
//             "headers": {
//                 "Content-Type": "application/json",
//                 "Authorization": "Bearer " + admintoken
//             },
//             "async": false,
//             "data": JSON.stringify(data)
//         };
//
//         $.ajax(settings2).done(function (response) {
//             cf = response;
//             data2 = {
//                 "CustomFields": [
//                     {
//                         "Code": cf.Code,
//                         "Values": [
//                             storedData
//                         ]
//                     }
//                 ]
//             }
//             var settings3 = {
//                 "url": "https://" + baseUrl + "/api/v2/marketplaces",
//                 "method": "POST",
//                 "headers": {
//                     "Content-Type": "application/json",
//                     "Authorization": "Bearer " + admintoken
//                 },
//                 "async": false,
//                 "data": JSON.stringify(data2)
//             };
//
//             $.ajax(settings3);
//         });
//
//
//     }
//
// }
//
//
// function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
//     createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
// }
//
//
// function retrieveCfValueJSON(cfName) {
//     var baseUrl = document.location.hostname;
//     var admintoken = getCookie('webapitoken');
//
//     var settings1 = {
//         "url": "https://" + baseUrl + "/api/v2/marketplaces",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "authorization": "Bearer " + admintoken
//         }
//
//     }
//     var mpCustomFields = []
//     $.ajax(settings1).done(function (response) {
//         mpCustomFields = response.CustomFields;
//     })
//
//     var cf = null;
//     for (i = 0; i < mpCustomFields.length; i++) {
//
//         if (mpCustomFields[i]["Name"] == cfName) {
//             cf = mpCustomFields[i];
//         }
//     }
//     if (cf) {
//         cf.Values[0] = JSON.parse(cf.Values[0]);
//         return cf;
//     }
//     else {
//         return false;
//     }
// }
//
//
// function retrieveCfListJson(cfNameList) {
//     var baseUrl = document.location.hostname;
//     var adminToken = getCookie('webapitoken');
//     var settings1 = {
//         "url": "https://" + baseUrl + "/api/v2/marketplaces",
//         "method": "GET",
//         "async": false,
//         "headers": {
//             "authorization": "Bearer " + adminToken
//         }
//
//     }
//     var mpCustomFields = []
//     $.ajax(settings1).done(function (response) {
//         mpCustomFields = response.CustomFields;
//     })
//
//     var cf = [];
//     for (j = 0; j < cfNameList.length; j++) {
//         cf.push(false);
//         for (i = 0; i < mpCustomFields.length; i++) {
//             if (cfNameList[j] == (mpCustomFields[i]["Name"])) {
//                 cf[j] = mpCustomFields[i];
//             }
//         }
//     }
//
//     for (i = 0; i < cf.length; i++) {
//         if (cf[i]) {
//             cf[i].Values[0] = JSON.parse(cf[i].Values[0]);
//         }
//     }
//
//     return cf;
// }
// // ==================================================================================================================================
// // Front end changes
//
// function singleGraph(tableData, yLines, xMarking, chartNode) {
//     var ctx = chartNode.getContext('2d');
//     var graphSettings = {
//         "type": "line",
//         "data": {
//             "labels": [],
//             "datasets": []
//         },
//         "options": {}
//     };
//     for (key in tableData) {
//         graphSettings.data.labels.push(tableData[key][xMarking]);
//     }
//     for (i = 0; i < yLines.length; i++) {
//         var currDataSet = {
//             'label': yLines[i],
//             'borderColor': 'rgb(' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ')',
//             'data': []
//         };
//         for (key in tableData) {
//             currDataSet.data.push(tableData[key][yLines[i]]);
//         }
//         graphSettings.data.datasets.push(currDataSet);
//     }
//     return (new Chart(ctx, graphSettings));
// }
//
// function groupGraphs() {
//
//     graphDiv = document.getElementById("graphs");
//     graphDiv.innerHTML = "";
//     groupings = getGrouping(parameterList.concat(extra));
//
//     for (let i = 1; i < groupings.length; i++) {
//         let currCanvas = document.createElement("canvas");
//         graphDiv.appendChild(currCanvas);
//         if (groupings[i].length) {
//             singleGraph(displayData, groupings[i], groupings[0], currCanvas);
//         }
//     }
//
// }
//
// function flipGraph() {
//     if ($(".flipper").hasClass("flip")) {
//         $(".flipper").removeClass("flip");
//         $(".front").removeClass("hide");
//     }
//     else {
//         $(".flipper").addClass("flip");
//         $(".front").addClass("hide");
//         groupGraphs();
//     }
// }
//
// function updateMetricsTime() {
//     var popUp = document.getElementById("popUpTime");
//     var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
//     for (i = 0; i < checkBoxes.length; i++) {
//         checkBoxStatus[i] = checkBoxes[i].childNodes[1].checked;
//     }
//     extra = [];
//     for (i = 0; i < checkBoxStatus.length; i++) {
//         if (checkBoxStatus[i]) {
//             extra.push(optionalMetrics[i]);
//         }
//     }
//     timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
//     displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
//     updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
//     groupGraphs();
//     addHelp();
// }
//
// function setCheckBoxValues() {
//     var popUp = document.getElementById("popUpTime");
//     var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
//     for (i = 0; i < checkBoxes.length; i++) {
//         checkBoxes[i].childNodes[1].checked = checkBoxStatus[i];
//     }
// }
//
// function retCSV(rankTable, timeTable, type) {
//     if (type == "rank") {
//         tableDataJson = rankTable;
//     } else {
//         tableDataJson = timeTable;
//     }
//     if (tableDataJson) {
//         var CSV = "";
//         var headings = "";
//         var outerKeys = Object.keys(tableDataJson);
//         var headingsJSON = tableDataJson[outerKeys[0]];
//         for (key in headingsJSON) {
//             headings += key.toString() + ",";
//         }
//         headings = headings.slice(0, headings.length - 1) + "\n";
//
//         for (key in tableDataJson) {
//             for (innerKey in tableDataJson[key]) {
//                 CSV += "\"" + tableDataJson[key][innerKey].toString() + "\"" + ",";
//             }
//             CSV = CSV.slice(0, CSV.length - 1) + "\n";
//         }
//         CSV = headings + CSV;
//
//         var hiddenElement = document.createElement('a');
//         hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);
//         hiddenElement.target = '_blank';
//         hiddenElement.download = 'Report.csv';
//         hiddenElement.click();
//     }
//     else {
//         toastr.error("Error", "Please select start date and end date")
//     }
// }
//
// function searchBar(userRecords, tableData, input) {
//     var queryData = [];
//     var count = 0
//     var userIdArray = [];
//     var requiredUsers1 = [];
//     var requiredUsers2 = [];
//     var params = Object.keys(tableData[Object.keys(tableData)[0]])
//     for (key in tableData) {
//         queryData[count] = $.extend(true, {}, tableData[key]);
//         queryData[count]["ID"] = key;
//         userIdArray.push(key);
//         count++;
//     }
//     for (i = 0; i < userRecords.length; i++) {
//         userRecords[i].FullName = userRecords[i].FirstName + " " + userRecords[i].LastName;
//     }
//     var options1 = {
//         "shouldSort": true,
//         "includeScore": true,
//         "includeMatches": true,
//         "threshold": 0.2,
//         "location": 0,
//         "distance": 100,
//         "maxPatternLength": 32,
//         "minMatchCharLength": 1,
//         "keys": ["Name", "FirstName", "LastName", "Email", "DisplayName", "FullName"]
//     }
//     options1.keys = options1.keys.concat(params);
//     var fuse = new Fuse(queryData, options1);
//     var fuse2 = new Fuse(userRecords, options1);
//     var result1 = fuse.search(input);
//     var result2 = fuse2.search(input);
//     for (i = 0; i < result1.length; i++) {
//         requiredUsers1.push(result1[i].item.ID);
//     }
//
//     for (i = 0; i < result2.length; i++) {
//         if (userIdArray.includes(result2[i].item.ID)) {
//             requiredUsers2.push(result2[i].item.ID);
//         };
//     }
//
//     var output = {};
//     var requiredUsers = requiredUsers1.concat(requiredUsers2);
//     for (i = 0; i < requiredUsers.length; i++) {
//         output[requiredUsers[i]] = tableData[requiredUsers[i]];
//     }
//     return output;
// }
//
//
// $(document).ready(function () {
//     userRecords = allUsers;
//     transactionRecords = records;
//     userData = retUserData(userRecords);
//     transacationData = retTransactionData(transactionRecords);
//     perMerchantData = calculateRatio(userRecords, transactionRecords);
//     allData = Object.assign(userData, transacationData, perMerchantData);
//     trans = calculateTransactions(transactionRecords);
//     msd = new Date(marketplaceStartDate);
//     allData[metrics[10]] = fillInMonth(calculateRatioRegisteredBuyers(transactionRecords)["historicData"]);
//     allData[metrics[11]] = displayLoginCount(retrieveCfValueJSON("loginCount"));
//     allData[metrics[12]] = calculateAveragePurchasesPerBuyer(trans, allData[metrics[0]]);
//     allData[metrics[13]] = calculateAverageOrderValue(allData[metrics[2]], trans);
//
//
//     $(".start").on('changeDate', function (selected) {
//         if (selected.date > currDay) {
//             toastr.error("Selected day cannot be after current day", "Incorrect Day");
//         } else {
//             startDateTime = selected.date;
//             timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
//             displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
//             updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
//             groupGraphs();
//             addHelp();
//         }
//     })
//
//
//     $(".end").on("changeDate", function (selected) {
//         if (selected.date > currDay) {
//             toastr.error("Selected day cannot be after current day", "Incorrect Day");
//         } else if (startDateTime) {
//             endDateTime = selected.date;
//             timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
//             displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
//             updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
//             groupGraphs();
//             addHelp();
//         }
//         else {
//             endDateTime = selected.date;
//         }
//     })
//
//     $("body").on("click", "#rank-day", function () {
//         timeDisplayType = "day";
//     });
//     $("body").on("click", "#rank-week", function () {
//         timeDisplayType = "week";
//     });
//     $("body").on("click", "#rank-month", function () {
//         timeDisplayType = "month";
//     });
//     $("body").on("click", "#rank-quarter", function () {
//         timeDisplayType = "quarter";
//     });
//     $("body").on("click", "#rank-year", function () {
//         timeDisplayType = "year";
//     });
//
//     $('body').on('click', '#rank-based', function () {
//         reportType = "rank";
//         $("#format").addClass("hide");
//     });
//     $('body').on('click', '#time-based', function () {
//         reportType = "time";
//         $("#format").removeClass("hide");
//     });
//
//     $('#loadingdiv').addClass("hide");
//     $('#mainstuff').removeClass("hide");
//
//     // visualization
//
//     addHelp();
// })
//
// // ==================================================================================================================================
// // calculations of metrics
//
//
// function retUserData(records, metricsArray = [metrics[0], metrics[1], metrics[7]]) {
//     monthWise = {};
//     for (i = 0; i < metricsArray.length; i++) {
//         monthWise[metricsArray[i]] = {}
//     }
//     for (i = 0; i < records.length; i++) {
//         dt = new Date(records[i]["DateJoined"] * 1000);
//         for (key in monthWise) {
//             monthInner = {}
//             for (j = 0; j < 12; j++) {
//                 monthInner[j] = {};
//             }
//             if (!monthWise[key][dt.getUTCFullYear()]) {
//                 monthWise[key][dt.getUTCFullYear()] = monthInner;
//             }
//             if (!monthWise[key][dt.getFullYear()][dt.getMonth()]) {
//                 monthWise[key][dt.getFullYear()][dt.getMonth()] = {};
//             }
//             if (!monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()]) {
//                 monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()] = 0;
//             }
//         }
//         for (j = 0; j < records[i]["Roles"].length; j++) {
//             if (records[i]["Roles"][j] == "User" && metricsArray.includes(metrics[0])) {
//                 monthWise[metrics[0]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
//             } else if (records[i]["Roles"][j] == "Merchant" && metricsArray.includes(metrics[1])) {
//                 monthWise[metrics[1]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
//             }
//         }
//     }
//     if (monthWise[metrics[0]] && monthWise[metrics[1]] && monthWise[metrics[7]]) {
//         for (year in monthWise[metrics[0]]) {
//             for (month in monthWise[metrics[0]][year]) {
//                 for (day in monthWise[metrics[0]][year][month]) {
//                     monthWise[metrics[7]][year][month][day] = [monthWise[metrics[1]][year][month][day], (monthWise[metrics[0]][year][month][day] - monthWise[metrics[1]][year][month][day])];
//
//                 }
//             }
//         }
//     }
//     return monthWise;
// }
//
//
// function retTransactionData(transactionRecords, metricsArray = [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]]) {
//     monthWise = {};
//     for (i = 0; i < metricsArray.length; i++) {
//         monthWise[metricsArray[i]] = {};
//     }
//     for (i = 0; i < transactionRecords.length; i++) {
//         dt = new Date(transactionRecords[i].Orders[0].PaymentDetails[0].DateTimeCreated * 1000);
//         for (key in monthWise) {
//             var monthInner = {}
//             for (j = 0; j < 12; j++) {
//                 monthInner[j] = {};
//             }
//             if (!monthWise[key][dt.getUTCFullYear()]) {
//                 monthWise[key][dt.getUTCFullYear()] = monthInner;
//             }
//             if (!monthWise[key][dt.getFullYear()][dt.getMonth()]) {
//                 monthWise[key][dt.getFullYear()][dt.getMonth()] = {};
//             }
//             if (!monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()]) {
//                 monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()] = 0;
//             }
//         }
//         if (monthWise[metrics[2]]) {
//             merchValue = Number(transactionRecords[i].Fee) + Number(transactionRecords[i].Total);
//             monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += merchValue / transactionRecords[i].Orders[0].PaymentDetails.length;
//             monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
//         }
//         if (monthWise[metrics[3]]) {
//             monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Fee / transactionRecords[i].Orders[0].PaymentDetails.length;
//             monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
//         }
//         if (monthWise[metrics[4]]) {
//             monthWise[metrics[4]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Orders.length;
//         }
//
//         for (j = 0; j < transactionRecords[i].Orders.length; j++) {
//             if (monthWise[metrics[6]]) {
//                 if (transactionRecords[i].Orders[j].CartItemDetails) {
//                     for (k = 0; k < transactionRecords[i].Orders[j].CartItemDetails.length; k++) {
//
//                         monthWise[metrics[6]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += parseInt(transactionRecords[i].Orders[j].CartItemDetails[k].Quantity);
//                     }
//                 }
//             }
//             if (monthWise[metrics[5]]) {
//                 if (transactionRecords[i].Orders[j].PaymentStatus == "Refunded") {
//                     monthWise[metrics[5]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
//                 }
//             }
//         }
//     }
//     return monthWise;
// }
//
//
// function calculateRatio(userRecords, transactionRecords, metricsArray = [metrics[8], metrics[9]]) {
//     var monthWise = {};
//     for (i = 0; i < metricsArray.length; i++) {
//         monthWise[metricsArray[i]] = {};
//     }
//
//     processedUserData = retUserData(userRecords, [metrics[1]]);
//
//     if (monthWise[metrics[8]]) {
//         revenue = retTransactionData(transactionRecords, [metrics[2]]);
//         for (year in revenue[metrics[2]]) {
//             if (!monthWise[metrics[8]][year]) {
//                 monthWise[metrics[8]][year] = {};
//             }
//             for (month in revenue[metrics[2]][year]) {
//                 if (!monthWise[metrics[8]][year][month]) {
//                     monthWise[metrics[8]][year][month] = {};
//                 }
//                 for (day in revenue[metrics[2]][year][month]) {
//                     var numerator = revenue[metrics[2]][year][month][day];
//                     if (!processedUserData[metrics[1]][year][month][day]) {
//                         denominator = 0;
//                     } else {
//                         denominator = processedUserData[metrics[1]][year][month][day];
//                     }
//                     monthWise[metrics[8]][year][month][day] = [numerator, denominator];
//                 }
//                 for (day in processedUserData[metrics[1]][year][month]) {
//                     if (!monthWise[metrics[8]][year][month][day]) {
//                         numerator = 0;
//                         denominator = processedUserData[metrics[1]][year][month][day];
//                         monthWise[metrics[8]][year][month][day] = [numerator, denominator];
//                     }
//                 }
//             }
//         }
//     }
//
//     if (monthWise[metrics[9]]) {
//         commission = retTransactionData(transactionRecords, [metrics[3]]);
//
//         for (year in commission[metrics[3]]) {
//             if (!monthWise[metrics[9]][year]) {
//                 monthWise[metrics[9]][year] = {}
//             }
//             for (month in commission[metrics[3]][year]) {
//                 if (!monthWise[metrics[9]][year][month]) {
//                     monthWise[metrics[9]][year][month] = {};
//                 }
//
//                 for (day in commission[metrics[3]][year][month]) {
//                     var numerator = commission[metrics[3]][year][month][day];
//                     if (!processedUserData[metrics[1]][year][month][day]) {
//                         denominator = 0;
//                     } else {
//                         denominator = processedUserData[metrics[1]][year][month][day];
//                     }
//                     monthWise[metrics[9]][year][month][day] = [numerator, denominator];
//                 }
//                 for (day in processedUserData[metrics[1]][year][month]) {
//                     if (!monthWise[metrics[9]][year][month][day]) {
//                         numerator = 0;
//                         denominator = processedUserData[metrics[1]][year][month][day];
//                         monthWise[metrics[9]][year][month][day] = [numerator, denominator];
//                     }
//                 }
//             }
//         }
//     }
//     return monthWise;
// }
//
// function calculateTransactions(transactionRecords) {
//     output = {};
//     for (i = 0; i < transactionRecords.length; i++) {
//         var dateObj = new Date(transactionRecords[i].Orders[0].CreatedDateTime * 1000);
//         if (!output[dateObj.getFullYear()]) {
//             output[dateObj.getFullYear()] = {};
//         }
//         if (!output[dateObj.getFullYear()][dateObj.getMonth()]) {
//             output[dateObj.getFullYear()][dateObj.getMonth()] = {};
//         }
//         if (!output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()]) {
//             output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()] = 0;
//         }
//         output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()]++;
//
//
//     }
//     return fillInMonth(output);
// }
//
// function calculateAveragePurchasesPerBuyer(transactions, buyer) {
//     var output = {};
//     for (year in transactions) {
//         output[year] = {};
//         for (month in transactions[year]) {
//             output[year][month] = {};
//             for (day in transactions[year][month]) {
//                 if (buyer[year][month][day]) {
//                     output[year][month][day] = [transactions[year][month][day], buyer[year][month][day]];
//                 } else {
//                     output[year][month][day] = [transactions[year][month][day], 0];
//                 }
//             }
//             for (day in buyer[year][month]) {
//                 if (!output[year][month][day]) {
//                     output[year][month][day] = [0, buyer[year][month][day]];
//                 }
//             }
//         }
//     }
//     return output;
// }
//
// function calculateAverageOrderValue(grossMerchandiseValue, transactions) {
//     var output = {};
//     for (year in transactions) {
//         output[year] = {};
//         for (month in transactions[year]) {
//             output[year][month] = {};
//             for (day in transactions[year][month]) {
//                 if (grossMerchandiseValue[year][month][day]) {
//                     output[year][month][day] = [grossMerchandiseValue[year][month][day], transactions[year][month][day]];
//                 } else {
//                     output[year][month][day] = [0, transactions[year][month][day]];
//                 }
//             }
//             for (day in grossMerchandiseValue[year][month]) {
//                 if (!output[year][month][day]) {
//                     output[year][month][day] = [grossMerchandiseValue[year][month][day], 0];
//                 }
//             }
//         }
//     }
//     return output;
// }
//
// function calculateCustomerLifetimeValue(grossMerchandiseValue, buyer) {
//     var output = {};
//     for (year in buyer) {
//         output[year] = {};
//         for (month in buyer[year]) {
//             output[year][month] = {};
//             for (day in buyer[year][month]) {
//                 if (grossMerchandiseValue[year][month][day]) {
//                     output[year][month][day] = [buyer[year][month][day], grossMerchandiseValue[year][month][day]];
//                 } else {
//                     output[year][month][day] = [buyer[year][month][day], 0];
//                 }
//             }
//             for (day in grossMerchandiseValue[year][month]) {
//                 if (!output[year][month][day]) {
//                     output[year][month][day] = [0, grossMerchandiseValue[year][month][day]];
//                 }
//             }
//         }
//     }
//     return output;
// }
//
// function getGrouping(metrics) {
//     var output = [];
//
//     for (i = 0; i < metricGroupings.length; i++) {
//
//         output.push([]);
//
//         for (j = 0; j < metrics.length; j++) {
//
//             if (metricGroupings[i].includes(metrics[j])) {
//
//                 output[i].push(metrics[j]);
//
//             }
//         }
//     }
//     output.splice(0, 0, ["Time-Interval"]);
//
//     return output;
// }
//
// function calculateRatioRegisteredBuyers(transactionRecords) {
//     var cfData = retrieveCfValueJSON("ratioregisteredtounregistered");
//     var baseUrl = document.location.hostname;
//     var regToNonReg;
//     if (!cfData) {
//         regToNonReg = { "historicData": {}, "time": 0 };
//     } else {
//         regToNonReg = cfData.Values[0];
//     }
//
//     var initialMaxTime = new Date(regToNonReg.time * 1000);
//     var maxTime = 0;
//     for (i = 0; i < transactionRecords.length; i++) {
//         for (j = 0; j < transactionRecords[i].Orders.length; j++) {
//             for (k = 0; k < transactionRecords[i].Orders[j].PaymentDetails.length; k++) {
//                 if (transactionRecords[i].Orders[j].PaymentDetails[k].InvoiceNo == transactionRecords[i].InvoiceNo) {
//                     var cTime = new Date(transactionRecords[i].Orders[j].PaymentDetails[k].DateTimeCreated * 1000);
//                     if (cTime > maxTime) {
//                         maxTime = cTime;
//                     }
//                     if (cTime > initialMaxTime) {
//                         var year = cTime.getFullYear();
//                         var month = cTime.getMonth();
//                         var day = cTime.getDate();
//                         if (!regToNonReg.historicData[year]) {
//                             regToNonReg.historicData[year] = {};
//                         }
//                         if (!regToNonReg.historicData[year][month]) {
//                             regToNonReg.historicData[year][month] = {};
//                         }
//                         if (!regToNonReg.historicData[year][month][day]) {
//                             regToNonReg.historicData[year][month][day] = [0, 0];
//                         }
//
//                         var settings = {
//                             "url": "https://" + baseUrl + "/api/v2/users/" + transactionRecords[i].Orders[j].PaymentDetails[k].Payer.ID,
//                             "method": "GET",
//                             "async": false
//                         }
//
//                         try {
//                             $.ajax(settings).done(function (response) {
//                                 if (response.DisplayName == "GUEST") {
//                                     regToNonReg.historicData[year][month][day][0]++;
//                                 } else {
//                                     regToNonReg.historicData[year][month][day][1]++;
//                                 }
//                             });
//                         } catch (err) {
//                             console.clear();
//                         }
//
//                     }
//
//                 }
//             }
//         }
//     }
//     if (maxTime > initialMaxTime) {
//         regToNonReg['time'] = maxTime.getTime() / 1000;
//         createCfImplementationsJSON("ratioregisteredtounregistered", regToNonReg, cfData);
//     }
//     return regToNonReg;
// }
//
//
// function displayLoginCount(loginData) {
//     loginData = loginData.Values[0];
//     latestDate = loginData.latestData.date.split("-");
//     delete loginData.latestData.date;
//     if (!loginData.historicalData[latestDate[2]]) {
//         loginData.historicalData[latestDate[2]] = {};
//     }
//     if (!loginData.historicalData[latestDate[2]][latestDate[1] - 1]) {
//         loginData.historicalData[latestDate[2]][latestDate[1] - 1] = {}
//     };
//     loginData.historicalData[latestDate[2]][latestDate[1] - 1][latestDate[0]] = loginData.latestData;
//     loginData = loginData.historicalData;
//
//     // var loginYears = Object.keys(loginData);
//     // for (var i = 0; i < loginYears.length; i++) {
//     //     let year = loginYears[i];
//     //     let months = Object.keys(loginData[year]);
//     //     for (var j = 0; j < months.length; j++) {
//     //         var month = parseInt(months[j]);
//     //         loginData[year][month - 1] = $.extend(true, {}, loginData[year][month]);
//     //     }
//     //     delete loginData[year][month];
//     // }
//
//
//     output = {};
//     for (year in loginData) {
//         output[year] = {};
//         for (month in loginData[year]) {
//             output[year][month] = {};
//             for (day in loginData[year][month]) {
//                 output[year][month][day] = 0;
//                 for (user in loginData[year][month][day]) {
//                     output[year][month][day] += loginData[year][month][day][user];
//                 }
//             }
//         }
//     }
//
//     var startYear = new Date(marketplaceStartDate).getFullYear()
//
//     for (i = startYear; i < currDay.getFullYear(); i++) {
//         if (!output[i]) {
//             output[i] = {};
//         }
//         for (j = 0; j < 12; j++) {
//             if (!output[i][j]) {
//                 output[i][j] = {};
//             }
//         }
//     }
//
//
//     return fillInYear(output, new Date(marketplaceStartDate));
// }
//
//
// // ==================================================================================================================================
// // some cumulative data conversion functions
// function convertMonthSpecificToCumulative(monthSpecificData) {
//     var netTotal = 0;
//     var cumulativeJson = {}
//     for (year in monthSpecificData) {
//         cumulativeJson[year] = {};
//         for (month in monthSpecificData[year]) {
//             netTotal = netTotal + monthSpecificData[year][month]['count'];
//             cumulativeJson[year][month] = { 'count': netTotal };
//             cumulativeJson[year][month]['count'] = Math.round(cumulativeJson[year][month]['count'] * 100) / 100;
//         }
//     }
//     return cumulativeJson;
// }
//
// // TODO: fix login data
// function cumDataConverter(msData, startDate, endDate, options) {
//     var ratioData = [metrics[0], metrics[1], metrics[2], metrics[3], metrics[4], metrics[5], metrics[6], metrics[11]];
//     var nonRatioData = [metrics[7], metrics[8], metrics[9], metrics[10], metrics[12], metrics[13]];
//
//     var startYear = startDate.getFullYear();
//     var endYear = endDate.getFullYear();
//     var startMonth = startDate.getMonth();
//
//     var endMonth = endDate.getMonth();
//     var startDay = startDate.getDate();
//     var endDay = endDate.getDate();
//
//     var cmData = {};
//     for (key in msData) {
//         var netTotal = 0;
//         var netTotal2 = 0;
//         if (options.includes(key)) {
//             cmData[key] = {};
//             for (var i = startYear; i <= endYear; i++) {
//                 if (startYear == endYear) {
//                     var startM = startMonth;
//                     var endM = endMonth;
//                 }
//                 else if (i == startYear) {
//                     var startM = startMonth;
//                     var endM = 11;
//                 }
//                 else if (i == endYear) {
//                     var startM = 0;
//                     var endM = endMonth;
//                 }
//                 else {
//                     var startM = 0;
//                     var endM = 11;
//                 }
//                 cmData[key][i] = {};
//                 for (var j = startM; j <= endM; j++) {
//                     if (startM == endM && startYear == endYear) {
//                         var startD = startDay;
//                         var endD = endDay;
//                     }
//                     else if (j == startM && i == startYear) {
//                         var startD = startDay;
//                         var endD = getMonthDays(i, j);
//                     }
//                     else if (j == endM && i == endYear) {
//                         var startD = 1;
//                         var endD = endDay;
//                     }
//                     else {
//                         var startD = 1;
//                         var endD = getMonthDays(i, j);
//                     }
//                     cmData[key][i][j] = {};
//                     for (var k = startD; k <= endD; k++) {
//
//                         if (ratioData.includes(key)) {
//                             try {
//                                 if (msData[key][i][j][k] && msData[key][i][j][k] != "not defined") {
//                                     netTotal = netTotal + msData[key][i][j][k];
//                                 }
//                                 cmData[key][i][j][k] = netTotal;
//                                 cmData[key][i][j][k] = Math.round(cmData[key][i][j][k] * 100) / 100;
//
//                             } catch (err) {
//                                 // msData[key];
//                             }
//                         }
//
//                         else if (nonRatioData.includes(key)) {
//                             if (msData[key][i][j][k] && msData[key][i][j][k] != "not defined") {
//                                 netTotal = netTotal + msData[key][i][j][k][Object.keys(msData[key][i][j][k])[0]];
//                                 netTotal2 = netTotal2 + msData[key][i][j][k][Object.keys(msData[key][i][j][k])[1]];
//                             }
//                             cmData[key][i][j][k] = netTotal / netTotal2;
//                             if (!isNaN(cmData[key][i][j][k])) {
//                                 cmData[key][i][j][k] = Math.round(cmData[key][i][j][k] * 100) / 100;
//                             } else {
//                                 cmData[key][i][j][k] = "not defined";
//                             }
//                         }
//
//                     }
//                 }
//             }
//         }
//     }
//     return cmData;
// }
//
// // ==================================================================================================================================
// // functions for month data
// function fillInMonth(timeData) {
//     for (year in timeData) {
//         for (i = 0; i < 12; i++) {
//             if (!timeData[year][i]) {
//                 timeData[year][i] = {};
//             }
//         }
//     }
//     return timeData;
// }
//
// function fillInYear(timeData, startMarketPlace) {
//     var startYear = startMarketPlace.getFullYear();
//     for (i = startYear; i < currDay.getFullYear(); i++) {
//         if (!timeData[i]) {
//             timeData[i] = {};
//         }
//     }
//     return fillInMonth(timeData);
// }
//
// function getMonthDays(year, month) {
//     var monthDays = { 0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30, 6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31 }
//
//     if (year % 4 == 0 && month == 1 && year % 100 != 0 || (year % 400 == 0 && month == 1)) {
//         return 29
//     }
//     else {
//         return monthDays[month];
//     }
// }
//
// // ==================================================================================================================================
// // displaying data
// function makeDisplayData(inputData, type) {
//     var outputData = {};
//     if (type == "day") {
//         for (key in inputData) {
//             for (year in inputData[key]) {
//                 for (month in inputData[key][year]) {
//                     for (day in inputData[key][year][month]) {
//                         timeStamp = day.toString() + "-" + (Number(month) + 1).toString() + "-" + year.toString();
//                         if (!outputData[timeStamp]) {
//                             outputData[timeStamp] = {};
//                             outputData[timeStamp]["Time-Interval"] = timeStamp;
//                         }
//                         outputData[timeStamp][key] = inputData[key][year][month][day];
//                         if (!inputData[key][year][month][day]) {
//                             outputData[timeStamp][key] = 0;
//                         }
//
//                     }
//                 }
//             }
//         }
//
//     }
//     else if (type == "week") {
//         for (key in inputData) {
//             count = 0;
//             for (year in inputData[key]) {
//                 for (month in inputData[key][year]) {
//                     for (day in inputData[key][year][month]) {
//                         count++;
//                         if (count % 7 == 0) {
//                             timeStamp = 'Week ' + parseInt(count / 7);
//                             if (!outputData[timeStamp]) {
//                                 outputData[timeStamp] = { "Time-Interval": timeStamp };
//                             }
//                             outputData[timeStamp][key] = inputData[key][year][month][day];
//                             if (!inputData[key][year][month][day]) {
//                                 outputData[timeStamp][key] = 0;
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     else if (type == "month") {
//         for (key in inputData) {
//             for (year in inputData[key]) {
//                 for (month in inputData[key][year]) {
//                     timeStamp = (Number(month) + 1).toString() + "-" + year.toString();
//                     if (!outputData[timeStamp]) {
//                         outputData[timeStamp] = {};
//                         outputData[timeStamp]["Time-Interval"] = timeStamp;
//                     }
//                     lastDay = Object.keys(inputData[key][year][month])[Object.keys(inputData[key][year][month]).length - 1];
//                     outputData[timeStamp][key] = inputData[key][year][month][lastDay];
//                     if (!inputData[key][year][month][lastDay]) {
//                         outputData[timeStamp][key] = 0;
//                     }
//                 }
//             }
//         }
//     }
//     else if (type == "quarter") {
//         for (key in inputData) {
//             count = 0;
//             for (year in inputData[key]) {
//                 for (month in inputData[key][year]) {
//                     count++;
//                     if (count % 3 == 0) {
//                         timeStamp = 'Quarter ' + parseInt(count / 3);
//                         if (!outputData[timeStamp]) {
//                             outputData[timeStamp] = {};
//                             outputData[timeStamp]["Time-Interval"] = timeStamp;
//                         }
//                         lastDay = Object.keys(inputData[key][year][month])[Object.keys(inputData[key][year][month]).length - 1];
//                         outputData[timeStamp][key] = inputData[key][year][month][lastDay];
//                         if (!inputData[key][year][month][day]) {
//                             outputData[timeStamp][key] = 0;
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     else if (type == "year") {
//         for (key in inputData) {
//             for (year in inputData[key]) {
//                 timeStamp = year.toString();
//                 if (!outputData[timeStamp]) {
//                     outputData[timeStamp] = {};
//                     outputData[timeStamp]["Time-Interval"] = timeStamp;
//                 }
//                 lastMonth = Object.keys(inputData[key][year])[Object.keys(inputData[key][year]).length - 1];
//                 lastDay = Object.keys(inputData[key][year][lastMonth])[Object.keys(inputData[key][year][lastMonth]).length - 1];
//                 outputData[timeStamp][key] = inputData[key][year][lastMonth][lastDay];
//                 if (!inputData[key][year][lastMonth][lastDay]) {
//                     outputData[timeStamp][key] = 0;
//                 }
//             }
//         }
//     }
//     return outputData;
// }
//
//
// function displayRegisteredRatio(timeData) {
//     for (year in timeData) {
//         for (month in timeData[year]) {
//             for (day in timeData[year][month]) {
//                 timeData[year][month][day] = String(Math.round(timeData[year][month][day][0] / timeData[year][month][day][1] * 100) / 100);
//             }
//         }
//     }
//     return timeData;
// }
// // ==================================================================================================================================
//
// function testing() {
//     tr = getRecordsTransactionHistory();
//     console.log("transactions records", tr);
//     liveCurrencyrates();
// }
//
// function liveCurrencyrates() {
//     apiUrl = "https://apilayer.net/api/live?access_key=";
//     apiKey = "d127cffe109d1db4a355ccc3cd10d762";
//     base = "USD";
//     var settings = {
//         "url": apiUrl + apiKey,
//         "method": "GET",
//         "async": false
//     }
//     $.ajax(settings).done(function (response) {
//         console.log("response", response);
//     })
//
// }
//
// function addHelp() {
//     var headings = document.getElementsByTagName("th");
//     for (var i = 0; i < headings.length; i++) {
//         var heading = headings[i];
//         // var c = heading.className;
//         // c+=" tooltip";
//         // heading.className = c;
//         // var helpDiv = document.createElement("div");
//         // helpDiv.className = "tooltip";
//         var help = document.createElement("span");
//         help.className = "tooltiptext";
//         if (heading.firstElementChild != null) {
//             if (helpDict[heading.firstElementChild.innerText]) {
//                 help.innerHTML = helpDict[heading.firstElementChild.innerText];
//             }
//             else {
//                 help.innerHTML = "description will be added in later";
//             }
//         }
//
//         // console.log("first child", heading);
//         // help.innerHTML = "Description goes here";    // helpDiv.appendChild(help);
//         heading.appendChild(help);
//         heading.style.zIndex = 0;
//     }
// }
