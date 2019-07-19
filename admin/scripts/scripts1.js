
var baseURL = window.location.hostname;
var token = getCookie('webapitoken');
var adminID;

var keyName = { "Merchant": "Total Revenue", "User": "Total Money Spent" };
var transactionName = { "Merchant": "Payee", "User": "Payer" };
var selectedOptions = { "MerchantOptions": [], "BuyerOptions": [], "ItemOptions": [], "PayOptions": [] };
var opt = { "Location": getLocation, "User Logins": getUserLogin };

var BuyerHistory;
var MerchantHistory;
var PaymentHistory;
var itemHistory;

var locationData;
var loginData;

var marketplaceStartDate = new Date();
var marketplaceEndDate = new Date();
var merchEndDate = new Date();
var buyerEndDate = new Date();
var payEndDate = new Date();
var itemEndDate = new Date();
var merchStartDate = new Date(merchEndDate - 2592000000);
var buyerStartDate = new Date(buyerEndDate - 2592000000);
var payStartDate = new Date(payEndDate - 2592000000);
var itemStartDate = new Date(itemEndDate - 2592000000);

var currDisplay;
var currMerchData;
var currBuyerData;
var currPayData;
var currItemData;
var optionalCurrMerchData;
var optionalCurrBuyerData;
var optionalCurrPayData;
var optionalCurrItemData;

var MegaData;
var currState = "Merchants";
var allUsers;
var records;

var chart;

var reportType;

var helpDict = { "Rank": "Description for rank", "Name": "Description for name", "Email": "Description for email" };

function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}



function getPaymentGateway() {
    return PaymentHistory;
}
function getLocation() {
    return locationData;
}
function getUserLogin() {
    return loginData;
}

function getFirstDate(megaData) {
    var firstYear = Object.keys(megaData)[0];
    var firstMonth = parseInt(Object.keys(megaData[firstYear])[0]) + 1;
    var firstDay = Object.keys(megaData[firstYear][firstMonth])[0];
    var stringDate = "" + firstMonth + "/" + firstDay + "/" + firstYear;
    return new Date(stringDate);
}
function addHelp() {
    var headings = document.getElementsByTagName("th");
    for (var i = 0; i < headings.length; i++) {
        var heading = headings[i];
        // var c = heading.className;
        // c+=" tooltip";
        // heading.className = c;
        // var helpDiv = document.createElement("div");
        // helpDiv.className = "tooltip";
        var help = document.createElement("span");
        help.className = "tooltiptext";
        help.innerHTML = helpDict[heading.div.innerHTML];
        // help.innerHTML = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.q";    // helpDiv.appendChild(help);
        heading.appendChild(help);
    }
}

function megaCalculation() {
    allUsers = getRecordsUserDetails();
    records = getRecordsTransactionHistory();

    adminID = document.getElementById("userGuid").value;

    MegaData = createMegaData();

    BuyerUsers = MegaData[0];

    MerchantUsers = MegaData[1];
    Items = MegaData[2];
    Pays = MegaData[3];

    MerchantHistory = calculateHistoricalData("Merchant");
    MerchantHistory = MerchantHistory[0];
    var Hist = calculateHistoricalData("User")

    BuyerHistory = Hist[0];
    PaymentHistory = Hist[1];
    itemHistory = Hist[2];

    // locationData =  calculateLocation();
    // loginData = retrieveCfValueJSON("loginCount");
    // loginData = loginData.Values[0];
    // latestDate = loginData.latestData.date.split("-");
    // delete loginData.latestData.date;
    // if (!loginData.historicalData[latestDate[2]]) {
    //   loginData.historicalData[latestDate[2]] = {};
    // }
    // if (!loginData.historicalData[latestDate[2]][latestDate[1] - 1]) {
    //   loginData.historicalData[latestDate[2]][latestDate[1] - 1] = {}
    // };
    // loginData.historicalData[latestDate[2]][latestDate[1] - 1][latestDate[0]] = loginData.latestData;
    // loginData = loginData.historicalData;
    // loginData = getCumulative(loginData, null, merchStartDate, merchEndDate, {}, true);

    currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);

    marketplaceStartDate -= 86400000



    userRecords = allUsers;
    transactionRecords = records;
    userData = retUserData(userRecords);
    transacationData = retTransactionData(transactionRecords);
    perMerchantData = calculateRatio(userRecords, transactionRecords);
    allData = Object.assign(userData, transacationData, perMerchantData);
    trans = calculateTransactions(transactionRecords);
    msd = new Date(marketplaceStartDate);
    temp = calculateRatioRegisteredBuyers(transactionRecords);
    temp = temp["historicData"];
    allData[metrics[10]] = fillInMonth(temp);
    // TODO: have to fix logins
    // temp = retrieveCfValueJSON("loginCount");
    // allData[metrics[11]] = displayLoginCount(temp);
    allData[metrics[12]] = calculateAveragePurchasesPerBuyer(trans, allData[metrics[0]]);
    allData[metrics[13]] = calculateAverageOrderValue(allData[metrics[2]], trans);
}




$(document).ready(function () {
    a = megaCalculation();
    console.log(liveCurrencyratesConversion());
    $('body').on('click', '#rank-based', function () {
        reportType = "rank";
        optionalCurrMerchData = addOptionsSelected("MerchantOptions");
        currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
        updateFrontEnd(currData, "merchants-tables", "merchant");
        $("#merchantStartDateDiv").children("input").datepicker("update", merchStartDate);
        $("#merchantEndtDateDiv").children("input").datepicker("update", merchEndDate);
        addHelp();
        // // console.log(reportType);
    });
    $('body').on('click', '#time-based', function () {
        reportType = "time";
        // // console.log(reportType);
    })

    $('#searchBar').on('input', function (e) {
        val = document.getElementById('searchBar').value;
        // // console.log(val);
        if (currState == "Merchants") {
            var tData = optionalCurrMerchData;
        }
        else if (currState == "Buyers") {
            var tData = optionalCurrBuyerData;
        }
        else if (currState == "Payment Gateways") {
            var tData = optionalCurrPayData;
        }
        else {
            var tData = optionalCurrItemData;
        }
        tableData = searchBar(allUsers, tData, val);
        // // console.log(tableData);
        if (val.length == 0) {
            tableData = currData;
        }

        if (currState == "Merchants") {

            updateFrontEnd(tableData, "merchants-tables", "merchant");
        }
        else if (currState == "Buyers") {
            updateFrontEnd(tableData, "buyers-tables", "user");
        }
        else if (currState == "Payment Gateways") {
            updateFrontEnd(tableData, "pay-tables", "pay");
        }
        else {
            updateFrontEnd(tableData, "item-tables", "item");
        }

    });

    $("#merchantTopRanks").on("change", function () {
        optionalCurrMerchData = addOptionsSelected("MerchantOptions");
        currData = rankings(optionalCurrMerchData, $(this).val());
        updateFrontEnd(currData, "merchants-tables", "merchant");
    });

    $("#buyerTopRanks").on("change", function () {
        optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
        currData = rankings(optionalCurrBuyerData, $(this).val());
        updateFrontEnd(currData, "buyers-tables", "user");
    });

    $("#itemTopRanks").on("change", function () {
        optionalCurrItemData = addOptionsSelected("ItemOptions");
        currData = rankings(optionalCurrItemData, $(this).val());
        updateFrontEnd(currData, "item-tables", "user");
    });

    $("#paymentTopRanks").on("change", function () {
        optionalCurrPayData = addOptionsSelected("PayOptions");
        currData = rankings(optionalCurrPayData, $(this).val());
        updateFrontEnd(currData, "pay-tables", "user");
    });

    $("#dataType li a").click(function () {
        currState = $(this).text();
        if (currState == "Buyers") {
            currBuyerData = getCumulative(BuyerHistory, keyName["User"], buyerStartDate, buyerEndDate, BuyerUsers);
            optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
            currData = rankings(optionalCurrBuyerData, $("#buyerTopRanks").val());
            updateFrontEnd(currData, "buyers-tables", "user");
            $("#buyerStartDateDiv").children("input").datepicker("update", buyerStartDate);
            $("#buyerEndDateDiv").children("input").datepicker("update", buyerEndDate);
        }
        else if (currState == "Merchants") {
            currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);
            optionalCurrMerchData = addOptionsSelected("MerchantOptions");
            currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
            updateFrontEnd(currData, "merchants-tables", "merchant");
            $("#merchantStartDateDiv").children("input").datepicker("update", merchStartDate);
            $("#merchantEndtDateDiv").children("input").datepicker("update", merchEndDate);
        }
        else if (currState == "Payment Gateways") {
            currPayData = getCumulative(PaymentHistory, "Money Transferred", payStartDate, payEndDate, Pays);
            optionalCurrPayData = addOptionsSelected("PayOptions");
            currData = rankings(optionalCurrPayData, $("#paymentTopRanks").val());
            updateFrontEnd(currData, "pay-tables", "pay");
            $("#payStartDateDiv").children("input").datepicker("update", payStartDate);
            $("#payEndDateDiv").children("input").datepicker("update", payEndDate);
        }
        else if (currState == "Items") {
            currItemData = getCumulative(itemHistory, "Number of Transactions", itemStartDate, itemEndDate, Items);
            optionalCurrItemData = addOptionsSelected("ItemOptions");
            currData = rankings(optionalCurrItemData, $("#itemTopRanks").val());
            updateFrontEnd(currData, "item-tables", "item");
            $("#itemStartDateDiv").children("input").datepicker("update", itemStartDate);
            $("#itemEndtDateDiv").children("input").datepicker("update", itemEndDate);
        }
    });

    $("#merchantStartDateDiv").children("input").on('changeDate', function (selected) {
        merchStartDate = new Date(selected.date.valueOf());
        if (merchEndDate >= merchStartDate) {
            if (merchStartDate <= marketplaceEndDate && merchStartDate >= marketplaceStartDate) {
                currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);
                optionalCurrMerchData = addOptionsSelected("MerchantOptions");
                currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
                updateFrontEnd(currData, "merchants-tables", "merchant");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }
        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#merchantEndtDateDiv").children("input").on('changeDate', function (selected) {
        merchEndDate = new Date(selected.date.valueOf());
        if (merchEndDate >= merchStartDate) {
            if (merchEndDate <= marketplaceEndDate && merchEndDate >= marketplaceStartDate) {
                currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);
                optionalCurrMerchData = addOptionsSelected("MerchantOptions");
                currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
                updateFrontEnd(currData, "merchants-tables", "merchant");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }

        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#buyerStartDateDiv").children("input").on('changeDate', function (selected) {
        buyerStartDate = new Date(selected.date.valueOf());

        if (buyerEndDate >= buyerStartDate) {
            if (buyerStartDate <= marketplaceEndDate && buyerStartDate >= marketplaceStartDate) {
                currBuyerData = getCumulative(BuyerHistory, keyName["User"], buyerStartDate, buyerEndDate, BuyerUsers);
                optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
                currData = rankings(optionalCurrBuyerData, $("#buyerTopRanks").val());
                updateFrontEnd(currData, "buyers-tables", "user");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }
        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#buyerEndDateDiv").children("input").on('changeDate', function (selected) {
        buyerEndDate = new Date(selected.date.valueOf());
        if (buyerEndDate >= buyerStartDate) {
            if (buyerEndDate <= marketplaceEndDate && buyerEndDate >= marketplaceStartDate) {
                currBuyerData = getCumulative(BuyerHistory, keyName["User"], buyerStartDate, buyerEndDate, BuyerUsers);
                optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
                currData = rankings(optionalCurrBuyerData, $("#buyerTopRanks").val());
                updateFrontEnd(currData, "buyers-tables", "user");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }

        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#itemStartDateDiv").children("input").on('changeDate', function (selected) {
        itemStartDate = new Date(selected.date.valueOf());

        if (itemEndDate >= itemStartDate) {
            if (itemStartDate <= marketplaceEndDate && itemStartDate >= marketplaceStartDate) {
                currItemData = getCumulative(itemHistory, "Number of Transactions", itemStartDate, itemEndDate, Items);
                optionalCurrItemData = addOptionsSelected("ItemOptions");
                currData = rankings(optionalCurrItemData, $("#itemTopRanks").val());
                updateFrontEnd(currData, "item-tables", "item");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }
        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#itemEndDateDiv").children("input").on('changeDate', function (selected) {
        itemEndDate = new Date(selected.date.valueOf());
        if (itemEndDate >= itemStartDate) {
            if (itemEndDate <= marketplaceEndDate && itemEndDate >= marketplaceStartDate) {
                currItemData = getCumulative(itemHistory, "Number of Transactions", itemStartDate, itemEndDate, Items);
                optionalCurrItemData = addOptionsSelected("ItemOptions");
                currData = rankings(optionalCurrItemData, $("#itemTopRanks").val());
                updateFrontEnd(currData, "item-tables", "item");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }

        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#payStartDateDiv").children("input").on('changeDate', function (selected) {
        payStartDate = new Date(selected.date.valueOf());

        if (payEndDate >= payStartDate) {
            if (payStartDate <= marketplaceEndDate && payStartDate >= marketplaceStartDate) {
                currPayData = getCumulative(PaymentHistory, "Money Transferred", payStartDate, payEndDate, Pays);
                optionalCurrPayData = addOptionsSelected("PayOptions");
                currData = rankings(optionalCurrPayData, $("#paymentTopRanks").val());
                updateFrontEnd(currData, "pay-tables", "pay");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }
        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });

    $("#payEndDateDiv").children("input").on('changeDate', function (selected) {
        payEndDate = new Date(selected.date.valueOf());
        if (payEndDate >= payStartDate) {
            if (itemEndDate <= marketplaceEndDate && itemEndDate >= marketplaceStartDate) {
                currPayData = getCumulative(PaymentHistory, "Money Transferred", payStartDate, payEndDate, Pays);
                optionalCurrPayData = addOptionsSelected("PayOptions");
                currData = rankings(optionalCurrPayData, $("#paymentTopRanks").val());
                updateFrontEnd(currData, "pay-tables", "pay");
            }
            else {
                toastr.error("This marketplace deosn't exist in this time", "Invalid date");
            }

        }
        else {
            toastr.error("End date cannot be before start date", "Invalid Date");
        }

    });


    $(".start").on('changeDate', function (selected) {
        if (selected.date > currDay) {
            toastr.error("Selected day cannot be after current day", "Incorrect Day");
        } else {
            startDateTime = selected.date;
            timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
            displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
            updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
            groupGraphs();
            addHelp();
        }
    })


    $(".end").on("changeDate", function (selected) {
        if (selected.date > currDay) {
            toastr.error("Selected day cannot be after current day", "Incorrect Day");
        } else if (startDateTime) {
            endDateTime = selected.date;
            timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
            displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
            updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
            groupGraphs();
            addHelp();
        }
        else {
            endDateTime = selected.date;
        }
    })

    $("body").on("click", "#rank-day", function () {
        timeDisplayType = "day";
    });
    $("body").on("click", "#rank-week", function () {
        timeDisplayType = "week";
    });
    $("body").on("click", "#rank-month", function () {
        timeDisplayType = "month";
    });
    $("body").on("click", "#rank-quarter", function () {
        timeDisplayType = "quarter";
    });
    $("body").on("click", "#rank-year", function () {
        timeDisplayType = "year";
    });

    $('body').on('click', '#rank-based', function () {
        reportType = "rank";
        $("#format").addClass("hide");
    });
    $('body').on('click', '#time-based', function () {
        reportType = "time";
        $("#format").removeClass("hide");
    });
    addHelp();
    $('#loadingdiv').addClass("hide");
    $('#mainstuff').removeClass("hide");

    // console.log("promise returned", a);
})



function visualize(tableData, yLines, xMarking) {
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets = [];
        chart.update();
    }
    var ctx = document.getElementById('myChart').getContext('2d');
    var graphSettings = {
        "type": "bar",
        "data": {
            "labels": [],
            "datasets": []
        },
        "options": {}
    };
    for (key in tableData) {
        graphSettings.data.labels.push(tableData[key][xMarking]);
    }
    for (i = 0; i < yLines.length; i++) {
        var currDataSet = {
            'label': yLines[i],
            'borderColor': 'rgb(' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ')',
            'data': []
        };
        for (key in tableData) {
            currDataSet.data.push(tableData[key][yLines[i]]);
        }
        graphSettings.data.datasets.push(currDataSet);
    }
    chart = new Chart(ctx, graphSettings);
}

function getCumulative(data, heading, startDate, endDate, userData, shallow = false) {
    // var cumilData = jQuery.extend(true, {}, data);
    //
    // var years = Object.keys(cumilData);
    // var firstMonth = Object.keys(cumilData[years[0]])[0];
    // var firstDay = Object.keys(cumilData[years[0]][firstMonth])[0];
    // var prevData = jQuery.extend(true, {}, cumilData[years[0]][firstMonth][firstDay]);

    var startYear = startDate.getUTCFullYear();
    var startMonth = startDate.getMonth();
    var startDay = startDate.getDate();

    var endYear = endDate.getUTCFullYear();
    var endMonth = endDate.getMonth();
    var endDay = endDate.getDate();


    var firstY = Object.keys(data)[0];
    var firstM = Object.keys(data[firstY])[0];
    var firstD = Object.keys(data[firstY][firstM])[0];
    var firstGuy = Object.keys(data[firstY][firstM][firstD])[0];
    var sample = data[firstY][firstM][firstD][firstGuy];
    var keys = Object.keys(sample);
    var dataStructure = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        dataStructure[key] = !isNaN(sample[key]);
    }

    var cumulData = jQuery.extend(true, {}, userData);

    for (var i = startYear; i <= endYear; i++) {
        if (startYear == endYear) {
            var startM = startMonth;
            var endM = endMonth;
        }
        else if (i == startYear) {
            var startM = startMonth;
            var endM = 11;
        }
        else if (i == endYear) {
            var startM = 0;
            var endM = endMonth;
        }
        else {
            var startM = 0;
            var endM = 11;
        }

        for (var j = startM; j <= endM; j++) {
            if (startM == endM && startYear == endYear) {
                var startD = startDay;
                var endD = endDay;
            }
            else if (j == startM && i == startYear) {
                var startD = startDay;
                var endD = getMonthDays(i, j);
            }
            else if (j == endM && i == endYear) {
                var startD = 1;
                var endD = endDay;
            }
            else {
                var startD = 1;
                var endD = getMonthDays(i, j);
            }

            for (var k = startD; k <= endD; k++) {
                // // console.log(k);
                if (data[i] != null) {
                    if (data[i][j] != null) {
                        if (data[i][j][k] != null) {
                            // // console.log("Exists");
                            var dayTransactions = data[i][j][k];

                            for (user in dayTransactions) {
                                if (shallow) {

                                    if (cumulData[user] == null) {

                                        cumulData[user] = dayTransactions[user];
                                    }
                                    else {
                                        cumulData[user] += dayTransactions[user];
                                    }
                                }
                                else {
                                    if (cumulData[user] == null) {
                                        cumulData[user] = {};
                                        for (var l = 0; l < keys.length; l++) {
                                            var key = keys[l];
                                            cumulData[user][key] = dayTransactions[user][key];

                                        }
                                    }
                                    else {
                                        for (var l = 0; l < keys.length; l++) {
                                            var key = keys[l];
                                            if (dataStructure[key]) {
                                                cumulData[user][key] += dayTransactions[user][key];
                                                cumulData[user][key] = Math.round(cumulData[user][key] * 100) / 100;
                                            }
                                        }
                                    }
                                }

                                // // console.log(jQuery.extend(true, {},cumulData));

                            }
                        }
                    }
                }


            }
        }
    }

    if (shallow) {
        return cumulData;
    }
    else {
        return sortData(cumulData, heading);
    }

}

function getOptionsSelected() {
    var Merchselected = [];
    var options = document.getElementById("merchant-options").getElementsByClassName("fancy-checkbox");
    var options = options[0].childNodes;

    for (var i = 1; i < options.length; i++) {
        if (options[i].checked) {
            Merchselected.push(options[i + 1].childNodes[0].innerHTML);
        }
    }

    var Buyerselected = [];
    var options = document.getElementById("buyer-options").getElementsByClassName("fancy-checkbox");
    var options = options[0].childNodes;

    for (var i = 1; i < options.length; i++) {
        if (options[i].checked) {
            Buyerselected.push(options[i + 1].childNodes[0].innerHTML);
        }
    }
    // console.log(Buyerselected);


    selectedOptions = { "MerchantOptions": Merchselected, "BuyerOptions": Buyerselected, "PayOptions": [], "ItemOptions": [] };
    optionalCurrMerchData = addOptionsSelected("MerchantOptions");
    updateFrontEnd(rankings(optionalCurrMerchData, $("#merchantTopRanks").val()), "merchants-tables", "merchant");

    optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
    updateFrontEnd(rankings(optionalCurrBuyerData, $("#buyerTopRanks").val()), "buyers-tables", "user");

    var currPage = $("#selectedDisplay").text();
    if (currPage == "Merchants") {
        currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
    }
    else if (currPage == "Buyers") {
        currData = rankings(optionalCurrBuyerData, $("#buyerTopRanks").val());
    }


}

function retCSV(rankTable, timeTable, type) {

    if (type == "rank") {
        tableDataJson = rankTable;

    } else {
        tableDataJson = timeTable;

    }

    // // console.log("type", type);
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


function addOptionsSelected(type) {
    var newMerchantData = jQuery.extend(true, {}, currMerchData);
    var newBuyerData = jQuery.extend(true, {}, currBuyerData);
    var newPayData = jQuery.extend(true, {}, currPayData);
    var newItemData = jQuery.extend(true, {}, currItemData);
    for (var i = 0; i < selectedOptions[type].length; i++) {

        var newCol = opt[selectedOptions[type][i]]();
        if (type[0] == "M") {
            // displayedMerchantData = addOption(displayedMerchantData,newCol,selectedOptions[type][i]);
            newMerchantData = addOption(newMerchantData, newCol, selectedOptions[type][i]);
        }
        else if (type[0] == "B") {
            // displayedBuyerData = addOption(displayedBuyerData,newCol,selectedOptions[type][i]);
            newBuyerData = addOption(newBuyerData, newCol, selectedOptions[type][i]);
        }
        else if (type[0] == "P") {
            newPayData = addOption(newPayData, newCol, selectedOptions[type][i]);
        }
        else if (type[0] == "I") {
            newItemData = addOption(newItemData, newCol, selectedOptions[type][i]);
        }
    }

    if (type[0] == "M") {
        return newMerchantData;
    }
    else if (type[0] == "B") {
        return newBuyerData;
    }
    else if (type[0] == "P") {
        return newPayData;
    }
    else {
        return newItemData;
    }
}



function addOption(currData, newCol, Heading) {

    var retData = {};
    var keys = Object.keys(currData);
    for (var i = 0; i < keys.length; i++) {
        var curr = currData[keys[i]];

        if (newCol[keys[i]] == null) {
            curr[Heading] = "Data deleted/doesn't exist";
        }
        else {
            curr[Heading] = newCol[keys[i]].toString();
        }

        retData[keys[i]] = curr;
    }
    return retData;
}

function setCheckValues() {
    var options = document.getElementById("merchant-options").getElementsByClassName("fancy-checkbox");
    var inputs = options[0].getElementsByTagName("input");
    var labels = options[0].getElementsByTagName("label");

    for (var i = 0; i < labels.length; i++) {
        if (selectedOptions["MerchantOptions"].indexOf(labels[i].innerText) > -1) {
            inputs[i].checked = true;
        }
        else {
            inputs[i].checked = false;
        }
    }

    var options = document.getElementById("buyer-options").getElementsByClassName("fancy-checkbox");
    var inputs = options[0].getElementsByTagName("input");
    var labels = options[0].getElementsByTagName("label");

    for (var i = 0; i < labels.length; i++) {
        if (selectedOptions["BuyerOptions"].indexOf(labels[i].innerText) > -1) {
            inputs[i].checked = true;
        }
        else {
            inputs[i].checked = false;
        }
    }
}


function rankings(data, rank) {
    var returnData = {};

    var keys = Object.keys(data);
    var countTill = keys.length < rank ? keys.length : rank;


    for (var i = 0; i < countTill; i++) {
        returnData[keys[i]] = Object.assign({}, data[keys[i]]);
    }

    return returnData;
}





function calculateLocation() {
    console.log("location api called");
    var locationData = {};
    var users = allUsers;


    $.each(users, function (index, user) {


        var userID = user["ID"];
        locationData[userID] = [];
        var settings3 = {
            "url": "https://" + baseURL + "/api/v2/users/" + userID + "/addresses",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            },
            "async": false
        };
        $.ajax(settings3).done(function (response) {
            var addresses = response["Records"];
            if (addresses.length == 0) {
                locationData[userID].push("Location Not Available");
            }
            else {
                for (var i = 0; i < addresses.length; i++) {
                    if (addresses[i]["Line1"] != null) {
                        locationData[userID].push(handleNull(addresses[i]["Line1"]) + ' ' + handleNull(addresses[i]["Line2"]));
                    }
                    else {
                        locationData[userID].push("Location Data Not Found");
                    }

                }
            }

        });

    });


    return locationData;
}

function handleNull(str) {
    if (str == null) {
        return "";
    }
    else {
        return str;
    }
}


function calculateHistoricalData(userType) {

    var orderHistory;
    var numOfRecords;
    var commPercent;
    var currDate = new Date();
    var MegaData = {};
    var payMegaData = {};
    var itemMegaData = {};
    var count = 0;

    // var MegaData = createMegaData(userType);
    var MegaData = {};




    $.each(records, function (index, record) {

        var orders = record["Orders"];
        $.each(orders, function (index, order) {

            var orderDate = new Date(order["CreatedDateTime"] * 1000);
            var orderYear = orderDate.getUTCFullYear();
            var orderMonth = orderDate.getMonth();
            var orderDay = orderDate.getDate();
            var cartDeets = order["CartItemDetails"];
            var totalOrderPrice = parseFloat(order["PaymentDetails"][0]["Total"]) + parseFloat(order["PaymentDetails"][0]["Fee"]);
            var totalTestPrice = 0;
            if (cartDeets != null) {
                $.each(cartDeets, function (index, cartDeet) {
                    var itemID = cartDeet["ItemDetail"]["ID"];
                    var itemName = cartDeet["ItemDetail"]["Name"];
                    var itemPrice = parseFloat(cartDeet["ItemDetail"]["Price"]);
                    var itemQuantity = parseInt(cartDeet["Quantity"]);
                    totalTestPrice += Math.round(itemPrice * itemQuantity * 100) / 100;
                    var seller = order["MerchantDetail"]["DisplayName"];
                    if (seller == null) {
                        seller = order["MerchantDetail"]["Email"];
                    }
                    if (itemMegaData[orderYear] == null) {
                        itemMegaData[orderYear] = {};
                    }
                    if (itemMegaData[orderYear][orderMonth] == null) {
                        itemMegaData[orderYear][orderMonth] = {};
                    }
                    if (itemMegaData[orderYear][orderMonth][orderDay] == null) {
                        itemMegaData[orderYear][orderMonth][orderDay] = {};
                    }
                    if (itemMegaData[orderYear][orderMonth][orderDay][itemID] == null) {
                        itemMegaData[orderYear][orderMonth][orderDay][itemID] = { "Name": itemName, "Number of Transactions": 1, "Total Money Spent": Math.round(itemQuantity * itemPrice * 100) / 100, "Total Quantity Bought": itemQuantity, "Seller": seller };
                    }
                    else {
                        itemMegaData[orderYear][orderMonth][orderDay][itemID]["Number of Transactions"] += 1;
                        itemMegaData[orderYear][orderMonth][orderDay][itemID]["Total Money Spent"] += itemQuantity * itemPrice;
                        itemMegaData[orderYear][orderMonth][orderDay][itemID]["Total Money Spent"] = Math.round(itemMegaData[orderYear][orderMonth][orderDay][itemID]["Total Money Spent"] * 100) / 100;
                        itemMegaData[orderYear][orderMonth][orderDay][itemID]["Total Quantity Bought"] += itemQuantity
                    }

                });
            }

            var payDetails = order["PaymentDetails"];
            $.each(payDetails, function (index, payDetail) {
                if (payDetail["InvoiceNo"] == record["InvoiceNo"]) {

                    var trans = transactionName[userType];
                    var kName = keyName[userType];

                    // if (orderYear != currDate.getUTCFullYear() || orderMonth != currDate.getMonth()) {
                    var price = parseFloat(payDetail["Total"]) + parseFloat(payDetail["Fee"]);
                    var fee = parseFloat(payDetail["Fee"]);
                    if (MegaData[orderYear] == null) {
                        MegaData[orderYear] = {};
                        payMegaData[orderYear] = {};
                    }
                    if (MegaData[orderYear][orderMonth] == null) {
                        MegaData[orderYear][orderMonth] = {};
                        payMegaData[orderYear][orderMonth] = {};
                    }
                    if (MegaData[orderYear][orderMonth][orderDay] == null) {
                        MegaData[orderYear][orderMonth][orderDay] = {};
                        payMegaData[orderYear][orderMonth][orderDay] = {};
                    }
                    if (MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]] == null) {
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]] = {
                            "Name": payDetail[trans]["FirstName"] + " " + payDetail[trans]["LastName"],
                            "Email": payDetail[trans]["Email"],
                            [kName]: Math.round(price * 100) / 100,
                            "Number of Orders": 1,
                            "Total Admin Commission": Math.round(fee * 100) / 100
                        }
                    }
                    else {
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]][keyName[userType]] += price;
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]][keyName[userType]] = Math.round(MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]][keyName[userType]] * 100) / 100;
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]]["Number of Orders"]++;
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]]["Total Admin Commission"] += fee;
                        MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]]["Total Admin Commission"] = Math.round(MegaData[orderYear][orderMonth][orderDay][payDetail[trans]["ID"]]["Total Admin Commission"] * 100) / 100;
                    }
                    if (payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]] == null) {
                        if (payDetail["Gateway"]["Code"] != null) {
                            payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]] = { "Name": payDetail["Gateway"]["Gateway"], "Money Transferred": Math.round(price * 100) / 100, "Admin Commission Earned": Math.round(fee * 100) / 100 };
                        }

                    }
                    else {
                        payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Money Transferred"] += price;
                        payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Money Transferred"] = Math.round(payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Money Transferred"] * 100) / 100;

                        payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Admin Commission Earned"] += fee;
                        payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Admin Commission Earned"] = Math.round(payMegaData[orderYear][orderMonth][orderDay][payDetail["Gateway"]["Code"]]["Admin Commission Earned"] * 100) / 100;
                    }

                }
                else {
                    return;
                }
            })
        })
    })



    // $.each(Object.keys(MegaData), function (index, year) {
    //   $.each(Object.keys(MegaData[year]), function (index, month) {
    //     MegaData[year][month] = sortData(MegaData[year][month], keyName[userType]);
    //   })
    // })
    // // console.log(MegaData);
    return [MegaData, payMegaData, itemMegaData];


}



function createMegaData() {
    console.log("create mega data called")
    var MegaDataUser = {};
    var MegaDataMerchant = {};
    var MegaDataItems = {};
    var MegaDataPay = {};
    var recordSize;
    var minYear;
    var minMonth;
    var numRec;
    var currDate = new Date();

    // // console.log(allUsers);
    $.each(allUsers, function (index, user) {
        // // console.log("user", user);
        var dateCreated = new Date(user["DateJoined"] * 1000);
        if (dateCreated < marketplaceStartDate) {
            marketplaceStartDate = dateCreated;
        }
        if (user.Roles) {
            if (user["Roles"].indexOf("Merchant") > -1) {
                if (MegaDataMerchant[user["ID"]] == null) {
                    MegaDataMerchant[user["ID"]] = { "Name": user["DisplayName"], "Email": user["Email"], "Total Revenue": 0, "Number of Orders": 0, "Total Admin Commission": 0 };
                }

            }

            if (MegaDataUser[user["ID"]] == null) {
                MegaDataUser[user["ID"]] = { "Name": user["DisplayName"], "Email": user["Email"], "Total Money Spent": 0, "Number of Orders": 0, "Total Admin Commission": 0 };
            }
        }




    });

    var settings = {
        "url": "https://" + baseURL + "/api/v2/items?pageSize=1",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer " + token
        },
        "async": false
    };

    $.ajax(settings).done(function (response) {
        numRec = response["TotalRecords"];
    });
    var settings = {
        "url": "https://" + baseURL + "/api/v2/items?pageSize=" + numRec,
        "method": "GET",
        "headers": {
            "Authorization": "Bearer " + token
        },
        "async": false
    };
    $.ajax(settings).done(function (res) {
        var items = res["Records"];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemName = item["Name"];
            var seller = item["MerchantDetail"]["DisplayName"];
            if (seller == null) {
                seller = item["MerchantDetail"]["Email"];
            }
            if (MegaDataItems[item["ID"]] == null) {
                MegaDataItems[item["ID"]] = { "Name": itemName, "Number of Transactions": 0, "Total Money Spent": 0, "Total Quantity Bought": 0, "Seller": seller };
            }
        }
    });
    var settings = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/payment-gateways/?pageSize=1",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer " + token
        },
        "async": false
    };
    $.ajax(settings).done(function (res) {
        numRec = res["TotalRecords"];
    });

    var settings = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/payment-gateways/?pageSize=" + numRec,
        "method": "GET",
        "headers": {
            "Authorization": "Bearer " + token
        },
        "async": false
    };

    $.ajax(settings).done(function (res) {
        var payments = res["Records"];
        for (var i = 0; i < payments.length; i++) {
            payment = payments[i];
            var payID = payment["Code"];
            var payName = payment["Gateway"];
            if (MegaDataPay[payID] == null) {
                MegaDataPay[payID] = { "Name": payName, "Money Transferred": 0, "Admin Commission Earned": 0 };
            }
        }

    });
    return [MegaDataUser, MegaDataMerchant, MegaDataItems, MegaDataPay];
}


function updateFrontEnd(data, tableID, type, sumBlackList = [], groupings = false) {

    var table = document.getElementById(tableID);
    var tableClass = table.className;
    table.innerHTML = "";
    table.className = "table";
    table.id = tableID;
    var totals = {};

    var header = document.createElement("thead");
    var body = document.createElement("tbody");
    var footer = document.createElement("tfoot");
    var footerRow = document.createElement("tr");
    footer.appendChild(footerRow);

    table.appendChild(header);
    table.appendChild(body);
    table.appendChild(footer);

    var headerRow = document.createElement("tr");
    var headers = {};
    keys = Object.keys(data);
    if (!groupings) {
        headers = data[keys[0]];
    }
    else {
        var borders = [];
        for (i = 0; i < groupings.length; i++) {
            if (borders.length) {
                borders.push(borders[borders.length - 1] + groupings[i].length);

            }
            else {
                borders.push(groupings[i].length);

            }
            for (j = 0; j < groupings[i].length; j++) {
                headers[groupings[i][j]] = "";
            }
        }
    }

    var count = 0;

    for (header in headers) {
        var heading = document.createElement("th");
        heading.innerHTML = header;

        if (borders) {
            if (borders.includes(count)) {
                heading.style = "border-left: 3px solid rgb(194, 194, 194); padding-left: 45px; z-index: 1;";
            }
        }

        headerRow.appendChild(heading);
        count++;
    }

    table.childNodes[0].appendChild(headerRow);

    for (merchant in data) {
        var newRow = document.createElement("tr");
        count = 0;
        for (header in headers) {
            var rowData = document.createElement("td");
            rowData.innerHTML = data[merchant][header];
            if (!isNaN(data[merchant][header])) {
                if (totals[header] == null) {
                    totals[header] = parseFloat(data[merchant][header]);
                }
                else {
                    totals[header] += parseFloat(data[merchant][header]);
                    totals[header] = Math.round(totals[header] * 100) / 100;
                }
            }
            if (borders) {
                if (borders.includes(count)) {
                    rowData.style = "border-left: 3px solid rgb(194, 194, 194); padding-left: 45px; z-index: 1;";
                }
            }
            newRow.appendChild(rowData);
            count++;
        }

        table.childNodes[1].appendChild(newRow);
    }

    var footerHeading = document.createElement("th");
    var totalContainer = document.createElement("div");
    var pTotal = document.createElement("p");
    // footerHeading.style = "text-align:center";

    pTotal.innerHTML = "Total";
    pTotal.style = "font-weight: bold; color:black"
    footerHeading.appendChild(pTotal);
    footerRow.appendChild(footerHeading)
    for (header in headers) {
        if (header != Object.keys(headers)[0] && !sumBlackList.includes(header)) {
            var footData = document.createElement("th");
            // footData.style = "text-align:center";
            if (totals[header] == null) {
                footData.innerHTML = "";
            }
            else {
                footData.innerHTML = totals[header];
            }

            footerRow.appendChild(footData);
        }

    }

    var results = document.getElementById(type + "resultsFound");
    results.innerHTML = Object.keys(data).length + " results found";
    $("#" + tableID).tablesorter();
    $("#" + tableID).trigger("updateAll");
}


function sortData(data, sortingKey) {
    arrayData = Object.keys(data).map(function (key) {
        return [key, data[key][sortingKey]];
    });

    sortedArray = mergesort(arrayData);

    sortedData = {}

    for (var i = 0; i < sortedArray.length; i++) {
        var ID = sortedArray[i][0];
        newData = Object.assign({ "Rank": i + 1 }, data[ID]);
        sortedData[ID] = newData;
    }

    return sortedData;

}

function getValue(array) {
    return array[1];
}

function mergesort(array) {
    if (array.length < 2) {
        return array
    }
    else {
        var mid = parseInt(array.length / 2);
        var left = array.splice(0, mid);
        var right = array;
        left = mergesort(left);
        right = mergesort(right);
        return merge(left, right);
    }
}

function merge(array1, array2) {
    var returnArr = [];

    while (array1.length != 0 && array2.length != 0) {
        if (getValue(array1[0]) == getValue(array2[0])) {
            returnArr.push(array1.shift());
            returnArr.push(array2.shift());
        }
        else if (getValue(array1[0]) > getValue(array2[0])) {
            returnArr.push(array1.shift());
        }
        else {
            returnArr.push(array2.shift());
        }
    }

    returnArr = returnArr.concat(array1);
    returnArr = returnArr.concat(array2);

    return returnArr;
}



function getMonthDays(year, month) {
    var monthDays = { 0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30, 6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31 }

    if (year % 4 == 0 && month == 1 && year % 100 != 0) {
        return 29
    }
    else {
        return monthDays[month];
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Global Variables used in the program

var metrics = ["Total-Users", "Total-Merchants", 'Gross-Merchandise-Value', 'Total-Admin-Commission', 'Total-Orders', 'Items-Refunded', 'Items-Sold', "Merchant-Buyer-Ratio", "Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant", "Guest-Registered-User-Ratio", "Total-Logins", "Average-Purchases-Per-Buyer", "Average-Order-Value"];
var optionalMetrics = [metrics[4], metrics[6], metrics[5], metrics[7], metrics[8], metrics[9], metrics[10], metrics[11], metrics[12], metrics[13]];
var parameterList = [metrics[0], metrics[1], metrics[2], metrics[3]];
var checkBoxStatus = [];
var extra = [];
var startDateTime = false;
var endDateTime = currDay = new Date();
var allData;
var timeDisplayType = "day";
var displayData;
var reportType;
var metricGroupings = [
    [metrics[0], metrics[1], metrics[7], metrics[10], metrics[11]],
    [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]],
    [metrics[8], metrics[9], metrics[12], metrics[13]]
]
var helpDict = {
    [metrics[0]]: "Number of users who joined",
    [metrics[1]]: "Number of merchants who joined",
    [metrics[2]]: "Total value made in the marketing place",
    [metrics[3]]: "The total commision made by the admin",
    [metrics[4]]: "Number of orders",
    [metrics[5]]: "Total number of items refunded",
    [metrics[6]]: "Total number of items sold",
    [metrics[7]]: "Ratio of merchants to buyers",
    [metrics[8]]: "The average revenue earned by a merchant",
    [metrics[9]]: "The average commission earned by an administrator",
    [metrics[10]]: "Ratio of purchases made by guest users to that made by registered users",
    [metrics[11]]: "Total number of logins in a particular time perion(calculation of logins only starts after the plugin has been installed)",
    [metrics[12]]: "The average number of purchases made by a buyer",
    [metrics[13]]: "The average value of an order",
    "Rank": "The rank depends on the metric on the immediate right",
    "Name": "Name of the merchant/buyer"
}
// ==================================================================================================================================
// API Calls
function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

// TODO: adapt this function to work with page sized more than 1000 transactions
function getRecordsUserDetails() {
    console.log("users called")

    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    adminID = document.getElementById("userGuid").value;

    var records;

    var settings = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
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
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
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


function getRecordsTransactionHistory() {
    console.log("Transaction called");
    adminID = document.getElementById("userGuid").value;

    baseURL = window.location.hostname;
    adminToken = getCookie("webapitoken");

    var transactionRecords = [];
    var count = 1;
    var length;
    while (true) {
        var settings1 = {
            "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=1000&pageNumber=" + count,
            "method": "GET",
            "async": false,
            "headers": {
                "Authorization": "Bearer " + adminToken
            }
        };

        $.ajax(settings1).done(function (response) {
            // console.log("response", response.Records);
            transactionRecords = transactionRecords.concat(response.Records);
            length = response.Records.length;
            console.log("length", length);
        })
        if (length < 1000) {
            break;

        }
        count++;
    }
    return transactionRecords;
}

// ==================================================================================================================================
// Custom Fields

function createCfImplementations(cfName, storedData, cf) {
    console.log("cf called")
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
            "async": false,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "data": JSON.stringify(data)
        };

        $.ajax(settings1);

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
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "async": false,
            "data": JSON.stringify(data)
        };

        $.ajax(settings2).done(function (response) {
            cf = response;
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
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + admintoken
                },
                "async": false,
                "data": JSON.stringify(data2)
            };

            $.ajax(settings3);
        });


    }

}


function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
    console.log("cf json called");
    createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
}


function retrieveCfValueJSON(cfName) {
    console.log("retrieve value called")
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
// ==================================================================================================================================
// Front end changes

function searchBar(userRecords, tableData, input) {
    // // console.log(userRecords);
    // // console.log(tableData);
    var queryData = [];
    var count = 0
    var userIdArray = [];
    var requiredUsers1 = [];
    var requiredUsers2 = [];
    var params = Object.keys(tableData[Object.keys(tableData)[0]])
    // // console.log(params);
    for (key in tableData) {
        queryData[count] = $.extend(true, {}, tableData[key]);
        queryData[count]["ID"] = key;
        userIdArray.push(key);
        count++;
    }
    for (i = 0; i < userRecords.length; i++) {
        userRecords[i].FullName = userRecords[i].FirstName + " " + userRecords[i].LastName;
    }
    var options1 = {
        "shouldSort": true,
        "includeScore": true,
        "includeMatches": true,
        "threshold": 0.2,
        "location": 0,
        "distance": 100,
        "maxPatternLength": 32,
        "minMatchCharLength": 1,
        "keys": ["Name", "FirstName", "LastName", "Email", "DisplayName", "FullName"]
    }
    options1.keys = options1.keys.concat(params);
    // // console.log(options1.keys);
    var fuse = new Fuse(queryData, options1);
    var fuse2 = new Fuse(userRecords, options1);
    var result1 = fuse.search(input);
    var result2 = fuse2.search(input);
    for (i = 0; i < result1.length; i++) {
        requiredUsers1.push(result1[i].item.ID);
    }

    for (i = 0; i < result2.length; i++) {
        if (userIdArray.includes(result2[i].item.ID)) {
            requiredUsers2.push(result2[i].item.ID);
        };
    }

    var output = {};
    var requiredUsers = requiredUsers1.concat(requiredUsers2);
    for (i = 0; i < requiredUsers.length; i++) {
        output[requiredUsers[i]] = tableData[requiredUsers[i]];
    }
    return output;
}

function singleGraph(tableData, yLines, xMarking, chartNode) {
    var ctx = chartNode.getContext('2d');
    var graphSettings = {
        "type": "line",
        "data": {
            "labels": [],
            "datasets": []
        },
        "options": {}
    };
    for (key in tableData) {
        graphSettings.data.labels.push(tableData[key][xMarking]);
    }
    for (i = 0; i < yLines.length; i++) {
        var currDataSet = {
            'label': yLines[i],
            'borderColor': 'rgb(' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ')',
            'data': []
        };
        for (key in tableData) {
            currDataSet.data.push(tableData[key][yLines[i]]);
        }
        graphSettings.data.datasets.push(currDataSet);
    }
    return (new Chart(ctx, graphSettings));
}

function groupGraphs() {

    graphDiv = document.getElementById("graphs");
    graphDiv.innerHTML = "";
    groupings = getGrouping(parameterList.concat(extra));

    for (let i = 1; i < groupings.length; i++) {
        let currCanvas = document.createElement("canvas");
        graphDiv.appendChild(currCanvas);
        if (groupings[i].length) {
            singleGraph(displayData, groupings[i], groupings[0], currCanvas);
        }
    }

}

function flipGraph() {
    if ($(".flipper").hasClass("flip")) {
        $(".flipper").removeClass("flip");
        $(".front").removeClass("hide");
    }
    else {
        $(".flipper").addClass("flip");
        $(".front").addClass("hide");
        groupGraphs();
    }
}

function updateMetricsTime() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxStatus[i] = checkBoxes[i].childNodes[1].checked;
    }
    extra = [];
    for (i = 0; i < checkBoxStatus.length; i++) {
        if (checkBoxStatus[i]) {
            extra.push(optionalMetrics[i]);
        }
    }
    timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
    displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
    updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
    groupGraphs();
    addHelp();
}

function setCheckBoxValues() {
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].childNodes[1].checked = checkBoxStatus[i];
    }
}

function retCSV(rankTable, timeTable, type) {
    if (type == "rank") {
        tableDataJson = rankTable;
    } else {
        tableDataJson = timeTable;
    }
    if (tableDataJson) {
        var CSV = "";
        var headings = "";
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




// ==================================================================================================================================
// calculations of metrics


function retUserData(records, metricsArray = [metrics[0], metrics[1], metrics[7]]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {}
    }
    for (i = 0; i < records.length; i++) {
        if (records[i]["Roles"]) {
            dt = new Date(records[i]["DateJoined"] * 1000);
            for (key in monthWise) {
                monthInner = {}
                for (j = 0; j < 12; j++) {
                    monthInner[j] = {};
                }
                if (!monthWise[key][dt.getUTCFullYear()]) {
                    monthWise[key][dt.getUTCFullYear()] = monthInner;
                }
                if (!monthWise[key][dt.getFullYear()][dt.getMonth()]) {
                    monthWise[key][dt.getFullYear()][dt.getMonth()] = {};
                }
                if (!monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()]) {
                    monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()] = 0;
                }
            }
            for (j = 0; j < records[i]["Roles"].length; j++) {
                if (records[i]["Roles"][j] == "User" && metricsArray.includes(metrics[0])) {
                    monthWise[metrics[0]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
                } else if (records[i]["Roles"][j] == "Merchant" && metricsArray.includes(metrics[1])) {
                    monthWise[metrics[1]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
                }
            }
        }
    }
    if (monthWise[metrics[0]] && monthWise[metrics[1]] && monthWise[metrics[7]]) {
        for (year in monthWise[metrics[0]]) {
            for (month in monthWise[metrics[0]][year]) {
                for (day in monthWise[metrics[0]][year][month]) {
                    monthWise[metrics[7]][year][month][day] = [monthWise[metrics[1]][year][month][day], (monthWise[metrics[0]][year][month][day] - monthWise[metrics[1]][year][month][day])];

                }
            }
        }
    }
    return monthWise;
}


function retTransactionData(transactionRecords, metricsArray = [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }
    for (i = 0; i < transactionRecords.length; i++) {
        dt = new Date(transactionRecords[i].Orders[0].PaymentDetails[0].DateTimeCreated * 1000);
        for (key in monthWise) {
            var monthInner = {}
            for (j = 0; j < 12; j++) {
                monthInner[j] = {};
            }
            if (!monthWise[key][dt.getUTCFullYear()]) {
                monthWise[key][dt.getUTCFullYear()] = monthInner;
            }
            if (!monthWise[key][dt.getFullYear()][dt.getMonth()]) {
                monthWise[key][dt.getFullYear()][dt.getMonth()] = {};
            }
            if (!monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()]) {
                monthWise[key][dt.getFullYear()][dt.getMonth()][dt.getDate()] = 0;
            }
        }
        if (monthWise[metrics[2]]) {
            merchValue = Number(transactionRecords[i].Fee) + Number(transactionRecords[i].Total);
            monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += merchValue / transactionRecords[i].Orders[0].PaymentDetails.length;
            monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
        }
        if (monthWise[metrics[3]]) {
            monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Fee / transactionRecords[i].Orders[0].PaymentDetails.length;
            monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
        }
        if (monthWise[metrics[4]]) {
            monthWise[metrics[4]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Orders.length;
        }

        for (j = 0; j < transactionRecords[i].Orders.length; j++) {
            if (monthWise[metrics[6]]) {
                if (transactionRecords[i].Orders[j].CartItemDetails) {
                    for (k = 0; k < transactionRecords[i].Orders[j].CartItemDetails.length; k++) {

                        monthWise[metrics[6]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += parseInt(transactionRecords[i].Orders[j].CartItemDetails[k].Quantity);
                    }
                }
            }
            if (monthWise[metrics[5]]) {
                if (transactionRecords[i].Orders[j].PaymentStatus == "Refunded") {
                    monthWise[metrics[5]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += 1;
                }
            }
        }
    }
    return monthWise;
}


function calculateRatio(userRecords, transactionRecords, metricsArray = [metrics[8], metrics[9]]) {
    var monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }

    processedUserData = retUserData(userRecords, [metrics[1]]);

    if (monthWise[metrics[8]]) {
        revenue = retTransactionData(transactionRecords, [metrics[2]]);
        for (year in revenue[metrics[2]]) {
            if (!monthWise[metrics[8]][year]) {
                monthWise[metrics[8]][year] = {};
            }
            for (month in revenue[metrics[2]][year]) {
                if (!monthWise[metrics[8]][year][month]) {
                    monthWise[metrics[8]][year][month] = {};
                }
                for (day in revenue[metrics[2]][year][month]) {
                    var numerator = revenue[metrics[2]][year][month][day];
                    if (!processedUserData[metrics[1]][year][month][day]) {
                        denominator = 0;
                    } else {
                        denominator = processedUserData[metrics[1]][year][month][day];
                    }
                    monthWise[metrics[8]][year][month][day] = [numerator, denominator];
                }
                for (day in processedUserData[metrics[1]][year][month]) {
                    if (!monthWise[metrics[8]][year][month][day]) {
                        numerator = 0;
                        denominator = processedUserData[metrics[1]][year][month][day];
                        monthWise[metrics[8]][year][month][day] = [numerator, denominator];
                    }
                }
            }
        }
    }

    if (monthWise[metrics[9]]) {
        commission = retTransactionData(transactionRecords, [metrics[3]]);

        for (year in commission[metrics[3]]) {
            if (!monthWise[metrics[9]][year]) {
                monthWise[metrics[9]][year] = {}
            }
            for (month in commission[metrics[3]][year]) {
                if (!monthWise[metrics[9]][year][month]) {
                    monthWise[metrics[9]][year][month] = {};
                }

                for (day in commission[metrics[3]][year][month]) {
                    var numerator = commission[metrics[3]][year][month][day];
                    if (!processedUserData[metrics[1]][year][month][day]) {
                        denominator = 0;
                    } else {
                        denominator = processedUserData[metrics[1]][year][month][day];
                    }
                    monthWise[metrics[9]][year][month][day] = [numerator, denominator];
                }
                for (day in processedUserData[metrics[1]][year][month]) {
                    if (!monthWise[metrics[9]][year][month][day]) {
                        numerator = 0;
                        denominator = processedUserData[metrics[1]][year][month][day];
                        monthWise[metrics[9]][year][month][day] = [numerator, denominator];
                    }
                }
            }
        }
    }
    return monthWise;
}

function calculateTransactions(transactionRecords) {
    output = {};
    for (i = 0; i < transactionRecords.length; i++) {
        var dateObj = new Date(transactionRecords[i].Orders[0].CreatedDateTime * 1000);
        if (!output[dateObj.getFullYear()]) {
            output[dateObj.getFullYear()] = {};
        }
        if (!output[dateObj.getFullYear()][dateObj.getMonth()]) {
            output[dateObj.getFullYear()][dateObj.getMonth()] = {};
        }
        if (!output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()]) {
            output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()] = 0;
        }
        output[dateObj.getFullYear()][dateObj.getMonth()][dateObj.getDate()]++;


    }
    return fillInMonth(output);
}

function calculateAveragePurchasesPerBuyer(transactions, buyer) {
    var output = {};
    for (year in transactions) {
        output[year] = {};
        for (month in transactions[year]) {
            output[year][month] = {};
            for (day in transactions[year][month]) {
                if (buyer[year][month][day]) {
                    output[year][month][day] = [transactions[year][month][day], buyer[year][month][day]];
                } else {
                    output[year][month][day] = [transactions[year][month][day], 0];
                }
            }
            for (day in buyer[year][month]) {
                if (!output[year][month][day]) {
                    output[year][month][day] = [0, buyer[year][month][day]];
                }
            }
        }
    }
    return output;
}

function calculateAverageOrderValue(grossMerchandiseValue, transactions) {
    var output = {};
    for (year in transactions) {
        output[year] = {};
        for (month in transactions[year]) {
            output[year][month] = {};
            for (day in transactions[year][month]) {
                if (grossMerchandiseValue[year][month][day]) {
                    output[year][month][day] = [grossMerchandiseValue[year][month][day], transactions[year][month][day]];
                } else {
                    output[year][month][day] = [0, transactions[year][month][day]];
                }
            }
            for (day in grossMerchandiseValue[year][month]) {
                if (!output[year][month][day]) {
                    output[year][month][day] = [grossMerchandiseValue[year][month][day], 0];
                }
            }
        }
    }
    return output;
}

function calculateCustomerLifetimeValue(grossMerchandiseValue, buyer) {
    var output = {};
    for (year in buyer) {
        output[year] = {};
        for (month in buyer[year]) {
            output[year][month] = {};
            for (day in buyer[year][month]) {
                if (grossMerchandiseValue[year][month][day]) {
                    output[year][month][day] = [buyer[year][month][day], grossMerchandiseValue[year][month][day]];
                } else {
                    output[year][month][day] = [buyer[year][month][day], 0];
                }
            }
            for (day in grossMerchandiseValue[year][month]) {
                if (!output[year][month][day]) {
                    output[year][month][day] = [0, grossMerchandiseValue[year][month][day]];
                }
            }
        }
    }
    return output;
}

function getGrouping(metrics) {
    var output = [];

    for (i = 0; i < metricGroupings.length; i++) {

        output.push([]);

        for (j = 0; j < metrics.length; j++) {

            if (metricGroupings[i].includes(metrics[j])) {

                output[i].push(metrics[j]);

            }
        }
    }
    output.splice(0, 0, ["Time-Interval"]);

    return output;
}

function calculateRatioRegisteredBuyers(transactionRecords) {
    console.log("reg to non reg called")
    var cfData = retrieveCfValueJSON("ratioregisteredtounregistered");
    var baseUrl = document.location.hostname;
    var regToNonReg;
    if (!cfData) {
        regToNonReg = { "historicData": {}, "time": 0 };
    } else {
        regToNonReg = cfData.Values[0];
    }

    var initialMaxTime = new Date(regToNonReg.time * 1000);
    var maxTime = 0;
    for (i = 0; i < transactionRecords.length; i++) {
        for (j = 0; j < transactionRecords[i].Orders.length; j++) {
            for (k = 0; k < transactionRecords[i].Orders[j].PaymentDetails.length; k++) {
                if (transactionRecords[i].Orders[j].PaymentDetails[k].InvoiceNo == transactionRecords[i].InvoiceNo) {
                    var cTime = new Date(transactionRecords[i].Orders[j].PaymentDetails[k].DateTimeCreated * 1000);
                    if (cTime > maxTime) {
                        maxTime = cTime;
                    }
                    if (cTime > initialMaxTime) {
                        var year = cTime.getFullYear();
                        var month = cTime.getMonth();
                        var day = cTime.getDate();
                        if (!regToNonReg.historicData[year]) {
                            regToNonReg.historicData[year] = {};
                        }
                        if (!regToNonReg.historicData[year][month]) {
                            regToNonReg.historicData[year][month] = {};
                        }
                        if (!regToNonReg.historicData[year][month][day]) {
                            regToNonReg.historicData[year][month][day] = [0, 0];
                        }

                        var settings = {
                            "url": "https://" + baseUrl + "/api/v2/users/" + transactionRecords[i].Orders[j].PaymentDetails[k].Payer.ID,
                            "method": "GET",
                            "async": false
                        }

                        try {
                            $.ajax(settings).done(function (response) {
                                if (response.DisplayName == "GUEST") {
                                    regToNonReg.historicData[year][month][day][0]++;
                                } else {
                                    regToNonReg.historicData[year][month][day][1]++;
                                }
                            });
                        } catch (err) {
                            // console.clear();
                        }

                    }

                }
            }
        }
    }
    if (maxTime > initialMaxTime) {
        regToNonReg['time'] = maxTime.getTime() / 1000;
        createCfImplementationsJSON("ratioregisteredtounregistered", regToNonReg, cfData);
    }
    return regToNonReg;
}


function displayLoginCount(loginData) {
    loginData = loginData.Values[0];
    latestDate = loginData.latestData.date.split("-");
    delete loginData.latestData.date;
    if (!loginData.historicalData[latestDate[2]]) {
        loginData.historicalData[latestDate[2]] = {};
    }
    if (!loginData.historicalData[latestDate[2]][latestDate[1] - 1]) {
        loginData.historicalData[latestDate[2]][latestDate[1] - 1] = {}
    };
    loginData.historicalData[latestDate[2]][latestDate[1] - 1][latestDate[0]] = loginData.latestData;
    loginData = loginData.historicalData;

    // var loginYears = Object.keys(loginData);
    // for (var i = 0; i < loginYears.length; i++) {
    //     let year = loginYears[i];
    //     let months = Object.keys(loginData[year]);
    //     for (var j = 0; j < months.length; j++) {
    //         var month = parseInt(months[j]);
    //         loginData[year][month - 1] = $.extend(true, {}, loginData[year][month]);
    //     }
    //     delete loginData[year][month];
    // }


    output = {};
    for (year in loginData) {
        output[year] = {};
        for (month in loginData[year]) {
            output[year][month] = {};
            for (day in loginData[year][month]) {
                output[year][month][day] = 0;
                for (user in loginData[year][month][day]) {
                    output[year][month][day] += loginData[year][month][day][user];
                }
            }
        }
    }

    var startYear = new Date(marketplaceStartDate).getFullYear()

    for (i = startYear; i < currDay.getFullYear(); i++) {
        if (!output[i]) {
            output[i] = {};
        }
        for (j = 0; j < 12; j++) {
            if (!output[i][j]) {
                output[i][j] = {};
            }
        }
    }


    return fillInYear(output, new Date(marketplaceStartDate));
}


// ==================================================================================================================================
// some cumulative data conversion functions
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

function cumDataConverter(msData, startDate, endDate, options) {
    var normalData = [metrics[0], metrics[1], metrics[2], metrics[3], metrics[4], metrics[5], metrics[6], metrics[11]];
    var ratioData = [metrics[7], metrics[8], metrics[9], metrics[10], metrics[12], metrics[13]];

    var startYear = startDate.getFullYear();
    var endYear = endDate.getFullYear();
    var startMonth = startDate.getMonth();

    var endMonth = endDate.getMonth();
    var startDay = startDate.getDate();
    var endDay = endDate.getDate();
    // console.log("msData", msData);
    var cmData = {};
    for (key in msData) {
        var netTotal = 0;
        var netTotal2 = 0;
        if (options.includes(key)) {
            cmData[key] = {};
            for (var i = startYear; i <= endYear; i++) {
                if (startYear == endYear) {
                    var startM = startMonth;
                    var endM = endMonth;
                }
                else if (i == startYear) {
                    var startM = startMonth;
                    var endM = 11;
                }
                else if (i == endYear) {
                    var startM = 0;
                    var endM = endMonth;
                }
                else {
                    var startM = 0;
                    var endM = 11;
                }
                cmData[key][i] = {};
                for (var j = startM; j <= endM; j++) {
                    if (startM == endM && startYear == endYear) {
                        var startD = startDay;
                        var endD = endDay;
                    }
                    else if (j == startM && i == startYear) {
                        var startD = startDay;
                        var endD = getMonthDays(i, j);
                    }
                    else if (j == endM && i == endYear) {
                        var startD = 1;
                        var endD = endDay;
                    }
                    else {
                        var startD = 1;
                        var endD = getMonthDays(i, j);
                    }
                    cmData[key][i][j] = {};
                    for (var k = startD; k <= endD; k++) {

                        if (normalData.includes(key)) {
                            try {
                                if (msData[key][i][j][k] && msData[key][i][j][k] != "not defined") {
                                    netTotal = netTotal + msData[key][i][j][k];
                                }
                                cmData[key][i][j][k] = netTotal;
                                cmData[key][i][j][k] = Math.round(cmData[key][i][j][k] * 100) / 100;

                            } catch (err) {
                            }
                        }

                        else if (ratioData.includes(key)) {
                            if (msData[key][i][j][k] && msData[key][i][j][k] != "not defined") {
                                if (msData[key][i][j][k][Object.keys(msData[key][i][j][k])[0]] == null || isNaN(msData[key][i][j][k][Object.keys(msData[key][i][j][k])[0]])) {
                                    msData[key][i][j][k][Object.keys(msData[key][i][j][k])[0]] = 0;
                                }
                                if (msData[key][i][j][k][Object.keys(msData[key][i][j][k])[1]] == null || isNaN(msData[key][i][j][k][Object.keys(msData[key][i][j][k])[1]])) {
                                    msData[key][i][j][k][Object.keys(msData[key][i][j][k])[1]] = 0;
                                }
                                netTotal = netTotal + msData[key][i][j][k][Object.keys(msData[key][i][j][k])[0]];
                                netTotal2 = netTotal2 + msData[key][i][j][k][Object.keys(msData[key][i][j][k])[1]];

                            }
                            cmData[key][i][j][k] = parseFloat(Number(netTotal) / Number(netTotal2));
                            if (!isNaN(cmData[key][i][j][k])) {
                                cmData[key][i][j][k] = Math.round(cmData[key][i][j][k] * 100) / 100;
                            } else {
                                cmData[key][i][j][k] = "not defined";
                            }
                        }

                    }
                }
            }
        }
    }
    return cmData;
}

// ==================================================================================================================================
// functions for month data
function fillInMonth(timeData) {
    for (year in timeData) {
        for (i = 0; i < 12; i++) {
            if (!timeData[year][i]) {
                timeData[year][i] = {};
            }
        }
    }
    return timeData;
}

function fillInYear(timeData, startMarketPlace) {
    var startYear = startMarketPlace.getFullYear();
    for (i = startYear; i < currDay.getFullYear(); i++) {
        if (!timeData[i]) {
            timeData[i] = {};
        }
    }
    return fillInMonth(timeData);
}

function getMonthDays(year, month) {
    var monthDays = { 0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30, 6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31 }

    if (year % 4 == 0 && month == 1 && year % 100 != 0 || (year % 400 == 0 && month == 1)) {
        return 29
    }
    else {
        return monthDays[month];
    }
}

// ==================================================================================================================================
// displaying data
function makeDisplayData(inputData, type) {
    var outputData = {};
    if (type == "day") {
        for (key in inputData) {
            for (year in inputData[key]) {
                for (month in inputData[key][year]) {
                    for (day in inputData[key][year][month]) {
                        timeStamp = day.toString() + "-" + (Number(month) + 1).toString() + "-" + year.toString();
                        if (!outputData[timeStamp]) {
                            outputData[timeStamp] = {};
                            outputData[timeStamp]["Time-Interval"] = timeStamp;
                        }
                        outputData[timeStamp][key] = inputData[key][year][month][day];
                        if (!inputData[key][year][month][day]) {
                            outputData[timeStamp][key] = 0;
                        }

                    }
                }
            }
        }

    }
    else if (type == "week") {
        for (key in inputData) {
            count = 0;
            for (year in inputData[key]) {
                for (month in inputData[key][year]) {
                    for (day in inputData[key][year][month]) {
                        count++;
                        if (count % 7 == 0) {
                            timeStamp = 'Week ' + parseInt(count / 7);
                            if (!outputData[timeStamp]) {
                                outputData[timeStamp] = { "Time-Interval": timeStamp };
                            }
                            outputData[timeStamp][key] = inputData[key][year][month][day];
                            if (!inputData[key][year][month][day]) {
                                outputData[timeStamp][key] = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    else if (type == "month") {
        for (key in inputData) {
            for (year in inputData[key]) {
                for (month in inputData[key][year]) {
                    timeStamp = (Number(month) + 1).toString() + "-" + year.toString();
                    if (!outputData[timeStamp]) {
                        outputData[timeStamp] = {};
                        outputData[timeStamp]["Time-Interval"] = timeStamp;
                    }
                    lastDay = Object.keys(inputData[key][year][month])[Object.keys(inputData[key][year][month]).length - 1];
                    outputData[timeStamp][key] = inputData[key][year][month][lastDay];
                    if (!inputData[key][year][month][lastDay]) {
                        outputData[timeStamp][key] = 0;
                    }
                }
            }
        }
    }
    else if (type == "quarter") {
        for (key in inputData) {
            count = 0;
            for (year in inputData[key]) {
                for (month in inputData[key][year]) {
                    count++;
                    if (count % 3 == 0) {
                        timeStamp = 'Quarter ' + parseInt(count / 3);
                        if (!outputData[timeStamp]) {
                            outputData[timeStamp] = {};
                            outputData[timeStamp]["Time-Interval"] = timeStamp;
                        }
                        lastDay = Object.keys(inputData[key][year][month])[Object.keys(inputData[key][year][month]).length - 1];
                        outputData[timeStamp][key] = inputData[key][year][month][lastDay];
                        if (!inputData[key][year][month][day]) {
                            outputData[timeStamp][key] = 0;
                        }
                    }
                }
            }
        }
    }
    else if (type == "year") {
        for (key in inputData) {
            for (year in inputData[key]) {
                timeStamp = year.toString();
                if (!outputData[timeStamp]) {
                    outputData[timeStamp] = {};
                    outputData[timeStamp]["Time-Interval"] = timeStamp;
                }
                lastMonth = Object.keys(inputData[key][year])[Object.keys(inputData[key][year]).length - 1];
                lastDay = Object.keys(inputData[key][year][lastMonth])[Object.keys(inputData[key][year][lastMonth]).length - 1];
                outputData[timeStamp][key] = inputData[key][year][lastMonth][lastDay];
                if (!inputData[key][year][lastMonth][lastDay]) {
                    outputData[timeStamp][key] = 0;
                }
            }
        }
    }
    return outputData;
}


function displayRegisteredRatio(timeData) {
    for (year in timeData) {
        for (month in timeData[year]) {
            for (day in timeData[year][month]) {
                timeData[year][month][day] = String(Math.round(timeData[year][month][day][0] / timeData[year][month][day][1] * 100) / 100);
            }
        }
    }
    return timeData;
}
// ==================================================================================================================================



// TODO: work on the currency exchange rates
function liveCurrencyratesConversion(transactionRecords, base = "AUD") {

    var currency;
    var currencies = [];
    var multicurrency = false;
    for (var i = 0; i<records.length; i++)
    {
      var invoice = records[i];
      if (i==0)
      {
        currencies.push(currency);
      }

      else if (currencies.indexOf(invoice["CurrencyCode"])==-1)
      {
        currencies.push(invoice["CurrencyCode"]);
        multicurrency = true;
      }

    }
    if (multicurrency)
    {
      var rates;
      $.ajax({
          "url": "https://api.exchangerate-api.com/v4/latest/" + base,
          "method": "GET",
          "async  ": false
      }).done((res) => {
          rates = res["rates"];
          console.log(rates);
      });
    }


}

function addHelp() {
    var headings = document.getElementsByTagName("th");
    for (var i = 0; i < headings.length; i++) {
        var heading = headings[i];
        // var c = heading.className;
        // c+=" tooltip";
        // heading.className = c;
        // var helpDiv = document.createElement("div");
        // helpDiv.className = "tooltip";
        var help = document.createElement("span");
        help.className = "tooltiptext";
        if (heading.firstElementChild != null) {
            if (helpDict[heading.firstElementChild.innerText]) {
                help.innerHTML = helpDict[heading.firstElementChild.innerText];
            }
            else {
                help.innerHTML = "description will be added in later";
            }
        }

        // // console.log("first child", heading);
        // help.innerHTML = "Description goes here";    // helpDiv.appendChild(help);
        heading.appendChild(help);
        heading.style.zIndex = 0;
    }
}
