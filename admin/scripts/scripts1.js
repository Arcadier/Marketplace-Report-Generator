/**
 * @fileoverview admin side code for the marketplace report generator plugin
 *
 * @author Naseer Ahmed Khan
 * @author Abhinav Narayana Balasubramaniam
 */

/**
 * baseURL - This global variable stores the domain name of the marketplace
 * @type {String}
 * @global
 * @constant
 */
var baseURL = window.location.hostname;

/**
 * token - This global variable stores the authorization token for making API calls
 * @type {String}
 * @global
 * @constant
 */
var token = getCookie('webapitoken');

/**
 * adminID - This global variable is meant for the adminID
 * @type {String}
 * @global
 */
var adminID;

/**
 * keyName - This is a JSON Object that has useful key value pairs to avoid writing if-else statements
 * @type {JSON}
 * @global
 */
var keyName = { "Merchant": "Total Revenue", "User": "Total Money Spent" };

/**
 * transactionName - The name that the API responses use to address merchants and buyers.
 * @type {JSON}
 * @global
 */
var transactionName = { "Merchant": "Payee", "User": "Payer" };

/**
 * selectedOptions - This JSON Object stores the options selected by the admin for each of the tables.
 * @type {JSON}
 * @global
 */
var selectedOptions = { "MerchantOptions": [], "BuyerOptions": [], "ItemOptions": [], "PayOptions": [] };

/**
 * opt - This JSON Object maps option names to the functions that will get you the option values.
 * @type {JSON}
 * @global
 */
var opt = { "Location": getLocation, "User Logins": getUserLogin };


/**
 * BuyerHistory - This is a JSON Object that has daily data of the transacton made by each user. There is no
 * data for the days in which there were no purchases.
 * @type {JSON}
 * @global
 */
var BuyerHistory;

/**
 * MerchantHistory - This is a JSON Object that has daily data of the transacton made by each merchant. There is no
 * data for the days in which there were no purchases.
 * @type {JSON}
 * @global
 */
var MerchantHistory;

/**
 * PaymentHistory - This is a JSON Object that has daily data on the transactions made using each payment gateeway.
 * @type {JSON}
 * @global
 */
var PaymentHistory;

/**
 * itemHistory - This is a JSON Object that has daily data of for each item. It contains total money spent on that item, total quantity
 * bought, total number of transactions, and the seller of the item.
 * @type {JSON}
 * @global
 */
var itemHistory;

/**
 * locationData - @deprecated
 */
var locationData;

/**
 * loginData - This JSON Object has daily data and maps users to the number of times they logged in that day. If no one logged in on a
 * particular day, no data is recorded.
 * @type {JSON}
 * @global
 * @deprecated
 */
var loginData;

/**
 * marketplaceStartDate - This is a date Object for the day the marketplace was created. It is initialized to current date but
 * will be changed later.
 * @type {Date}
 * @global
 */
var marketplaceStartDate = new Date();

/**
 * marketplaceEndDate - This is a date Object for the current date.
 * @type {Date}
 * @global
 */
var marketplaceEndDate = new Date();

/**
 * merchEndDate - This is a date Obect for the end date the admin choses for the top merchants table.
 * @type {Date}
 * @global
 */
var merchEndDate = new Date();

/**
 * buyerEndDate - This is a date Obect for the end date the admin choses for the top users table.
 * @type {Date}
 * @global
 */
var buyerEndDate = new Date();

/**
 * payEndDate - This is a date Object for the end date the admin choses for the top payment gateway table.
 * @type {Date}
 * @global
 */
var payEndDate = new Date();

/**
 * itemEndDate - This is a date Object for the end date the admin choses for the top items table.
 * @type {Date}
 * @global
 */
var itemEndDate = new Date();

/**
 * merchStartDate - This is a date Obect for the start date the admin choses for the top merchants table. This is calculated by subrtacting 1 month
 * from start date.
 * @type {Date}
 * @global
 */
var merchStartDate = new Date(merchEndDate - 2592000000);

/**
 * buyerStartDate - This is a date Obect for the start date the admin choses for the buyer merchants table. This is calculated by subrtacting 1 month
 * from start date.
 * @type {Date}
 * @global
 */
var buyerStartDate = new Date(buyerEndDate - 2592000000);

/**
 * payStartDate - This is a date Obect for the start date the admin choses for the top payment gateway table. This is calculated by subrtacting 1 month
 * from start date.
 * @type {Date}
 * @global
 */
var payStartDate = new Date(payEndDate - 2592000000);

/**
 * ietmStartDate - This is a date Obect for the start date the admin choses for the top items table. This is calculated by subrtacting 1 month
 * from start date.
 * @type {Date}
 * @global
 */
var itemStartDate = new Date(itemEndDate - 2592000000);

/**
 * currDisplay - This is a JSON Object that stores the information of the currently displaying table.
 * @type {JSON}
 * @global
 */
var currDisplay;

/**
 * currMerchData - This is a JSON Object that stores merchant data for the time frame admin has picked.
 * @type {JSON}
 * @global
 */
var currMerchData;

/**
 * currBuyerData - This is a JSON Object that stores buyer data for the time frame admin has picked.
 * @type {JSON}
 * @global
 */
var currBuyerData;

/**
 * currPayData - This is a JSON Object that stores payment gateway data for the time frame admin has picked.
 * @type {JSON}
 * @global
 */
var currPayData;

/**
 * currItemData - This is a JSON Object that stores items data for the time frame admin has picked.
 * @type {JSON}
 * @global
 */
var currItemData;

/**
 * optionalCurrMerchData - This is a JSON Object that stores merchant data for the picked time frame, with added optional data
 * @type {JSON}
 * @global
 */
var optionalCurrMerchData;

/**
 * optionalCurrBuyerData - This is a JSON Object that stores buyer data for the picked time frame, with added optional data
 * @type {JSON}
 * @global
 */
var optionalCurrBuyerData;

/**
 * optionalCurrPayData - This is a JSON Object that stores payment gateway data for the picked time frame, with added optional data
 * @type {JSON}
 * @global
 */
var optionalCurrPayData;

/**
 * optionalCurrItemData - This is a JSON Object that stores items data for the picked time frame, with added optional data
 * @type {JSON}
 * @global
 */
var optionalCurrItemData;

/**
 * MegaData - This is a JSON Object that contains the historical data of users, items and payent gateways
 * @type {JSON}
 * @global
 */
var MegaData;

/**
 * currState - This global variable stores the current table the admin is looking at
 * @type {String}
 * @global
 */
var currState = "Merchants";

/**
 * allUsers - This JSON Object stores information on all users in the marketplace
 * @type {JSON}
 * @global
 */
var allUsers;

/**
 * records - This JSON Object stores information on all the transactions in the history of the marketplace.
 * @type {JSON}
 * @global
 */
var records;

/**
 * reportType - This global variable stores which type of reprort the admin is viewing. Periodic or Performace
 * @type {String}
 * @global
 */
var reportType;


/**
 * getCookie - This function takes cookie name and returns the cookie value
 *
 * @param  {String} name Cookie name
 * @return {String}      Cookie Value
 */
function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

/**
 * getPaymentGateway - This function returns the variable PaymentHistory
 *
 * @return {JSON}  PaymentHistory
 */
function getPaymentGateway() {
    return PaymentHistory;
}

/**
 * getLocation - This function returns the variable locationData
 *
 * @return {JSON}  locationData
 */
function getLocation() {
    return locationData;
}

/**
 * getUserLogin - This function returns the variable loginData
 *
 * @return {JSON}  loginData
 * @deprecated
 */
function getUserLogin() {
    return loginData;
}

/**
 * getFirstDate - @deprecated
 *
 */
function getFirstDate(megaData) {
    var firstYear = Object.keys(megaData)[0];
    var firstMonth = parseInt(Object.keys(megaData[firstYear])[0]) + 1;
    var firstDay = Object.keys(megaData[firstYear][firstMonth])[0];
    var stringDate = "" + firstMonth + "/" + firstDay + "/" + firstYear;
    return new Date(stringDate);
}

/**
 * function to do all the calculations for all the data analysis
 *
 */
function megaCalculation() {
    // getting all the records by making api calls
    allUsers = getRecordsUserDetails();
    records = getRecordsTransactionHistory();

    adminID = document.getElementById("userGuid").value;
    // calculating all the performance report ddda
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


    // TODO: fix the logins for new marketplaces
    temp = new Date();
    currDate = temp.getDate() + "-" + (Number(temp.getMonth()) + 1) + "-" + temp.getFullYear();
    // locationData = calculateLocation();
    loginData = retrieveCfValueJSON("loginCount");
		var loginTemp;
    if (loginData) {
        loginData = loginData.Values[0];
				loginTemp = $.extend(true,{},loginData);
        latestDate = loginData.latestData.date.split("-");
        delete loginData.latestData.date;
        if (!loginData.historicalData[latestDate[2]]) {
            loginData.historicalData[latestDate[2]] = {};
        }
        if (!loginData.historicalData[latestDate[2]][latestDate[1] - 1]) {
            loginData.historicalData[latestDate[2]][latestDate[1] - 1] = {}
        };
        loginData.historicalData[latestDate[2]][latestDate[1] - 1][latestDate[0]] = loginData.latestData;
    } else {
        var loginc = { "latestData": { "date": currDate }, "historicalData": {} };
        createCfImplementationsJSON("loginCount", loginc, false);
        loginData = loginc;
				loginTemp = loginc;
    }

    loginData = loginData.historicalData;
    loginData = getCumulative(loginData, null, merchStartDate, merchEndDate, {}, true);
    console.log("login data inside mega calculation", loginData);


    currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);

    marketplaceStartDate -= 86400000


    // setting all the required variables
    userRecords = allUsers;
    transactionRecords = records;
    // calculating all different types of metrics
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
    allData[metrics[11]] = displayLoginCount(loginTemp);
    console.log("display format of login data", allData[metrics[11]])

    allData[metrics[12]] = calculateAveragePurchasesPerBuyer(trans, allData[metrics[0]]);
    allData[metrics[13]] = calculateAverageOrderValue(allData[metrics[2]], trans);
}



/**
 * code which runs after the DOM has been rendered
 */
$(document).ready(function () {
    megaCalculation();

    // TODO: work on currency exchange rates
    console.log(liveCurrencyratesConversion());

    // adding onclicks to the performance selector
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

    // adding onclick to the time based selector
    $('body').on('click', '#time-based', function () {
        reportType = "time";
        // // console.log(reportType);
    })

    // adding in functionality to the search bar, searches are performed live whenever a change to the input occurs
    $('#searchBar').on('input', function (e) {
        // getting the input tag for search bar
        val = document.getElementById('searchBar').value;

        // checking out the state currently picked out
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
        // setting the table data to the result of the search
        tableData = searchBar(allUsers, tData, val);
        // set the table back to normal if search is removed
        if (val.length == 0) {
            tableData = currData;
        }

        // update the table with different performace reports
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

    // dynamically changing the number of performace rows based on the number entered in
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

    // setting the type of the performace report
    $("#dataType li a").click(function () {
        currState = $(this).text();
        if (currState == "Buyers") {
            currBuyerData = getCumulative(BuyerHistory, keyName["User"], buyerStartDate, buyerEndDate, BuyerUsers);
            optionalCurrBuyerData = addOptionsSelected("BuyerOptions");
            currData = rankings(optionalCurrBuyerData, $("#buyerTopRanks").val());
            updateFrontEnd(currData, "buyers-tables", "user");
            $("#buyerStartDateDiv").children("input").datepicker("update", buyerStartDate);
            $("#buyerEndDateDiv").children("input").datepicker("update", buyerEndDate);
						addHelp();
        }
        else if (currState == "Merchants") {
            currMerchData = getCumulative(MerchantHistory, keyName["Merchant"], merchStartDate, merchEndDate, MerchantUsers);
            optionalCurrMerchData = addOptionsSelected("MerchantOptions");
            currData = rankings(optionalCurrMerchData, $("#merchantTopRanks").val());
            updateFrontEnd(currData, "merchants-tables", "merchant");
            $("#merchantStartDateDiv").children("input").datepicker("update", merchStartDate);
            $("#merchantEndtDateDiv").children("input").datepicker("update", merchEndDate);
						addHelp();
        }
        else if (currState == "Payment Gateways") {
            currPayData = getCumulative(PaymentHistory, "Money Transferred", payStartDate, payEndDate, Pays);
            optionalCurrPayData = addOptionsSelected("PayOptions");
            currData = rankings(optionalCurrPayData, $("#paymentTopRanks").val());
            updateFrontEnd(currData, "pay-tables", "pay");
            $("#payStartDateDiv").children("input").datepicker("update", payStartDate);
            $("#payEndDateDiv").children("input").datepicker("update", payEndDate);
						addHelp();
        }
        else if (currState == "Items") {
            currItemData = getCumulative(itemHistory, "Number of Transactions", itemStartDate, itemEndDate, Items);
            optionalCurrItemData = addOptionsSelected("ItemOptions");
            currData = rankings(optionalCurrItemData, $("#itemTopRanks").val());
            updateFrontEnd(currData, "item-tables", "item");
            $("#itemStartDateDiv").children("input").datepicker("update", itemStartDate);
            $("#itemEndtDateDiv").children("input").datepicker("update", itemEndDate);
						addHelp();
        }
    });

    // setting on change functions for start date for performance report of merchants
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

    // setting on change functions for end date for performance report of merchants
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

    // setting on change functions for start date for performance report of buyer
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

    // setting on change functions for end date for performance report of buyer
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

    // setting on change functions for start date for performance report of items
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

    // setting on change functions for end date for performance report of items
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

    // setting on change functions for start date for performance report of payment gateways
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

    // setting on change functions for end date for performance report of payment gateways
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

    // setting the start date to the report
    $(".start").on('changeDate', function (selected) {
        if (selected.date > currDay) {
            toastr.error("Selected day cannot be after current day", "Incorrect Day");
        } else if (selected.date < new Date(marketplaceStartDate)) {
            toastr.error("This marketplace deosn't exist in this time", "Invalid date");
        }
        else {
            startDateTime = selected.date;
            timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
            displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
            // updating the table, graphing and adding in help bars
            updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
            groupGraphs();
            addHelp();
        }
    })


    // setting the end date to the report
    $(".end").on("changeDate", function (selected) {
        if (selected.date > currDay) {
            toastr.error("Selected day cannot be after current day", "Incorrect Day");
        } else if (selected.date < new Date(marketplaceStartDate)) {
            toastr.error("This marketplace deosn't exist in this time", "Invalid date");
        }
        else if (startDateTime) {
            endDateTime = selected.date;
            timeCumulativeData = cumDataConverter(allData, startDateTime, endDateTime, parameterList.concat(extra));
            displayData = makeDisplayData(timeCumulativeData, timeDisplayType);
            // updating the table, graphing and adding in help bars
            updateFrontEnd(displayData, "time-based-tables", "time", metrics, getGrouping(parameterList.concat(extra)));
            groupGraphs();
            addHelp();
        }
        else {
            endDateTime = selected.date;
        }
    })

    // changing the format of time for periodic reports
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

    // setting the report types for rank based and time based
    $('body').on('click', '#rank-based', function () {
        reportType = "rank";
        $("#format").addClass("hide");
    });
    $('body').on('click', '#time-based', function () {
        reportType = "time";
        $("#format").removeClass("hide");
    });
    // adding in the help hovers for every heading
    addHelp();
    // removing the loading animation after all the API calls and calculations have been done
    $('#loadingdiv').addClass("hide");
    $('#mainstuff').removeClass("hide");

})

/**
 * getCumulative - This data takes the daily data of any type of report in perfromance based and a time frame (start date and end date)
 * and calculates the cumulative data of each merchant/buyer/item/payment gateway in that timeframe. It also takes in data of all the
 * merchant/buyer/item/payment gateway and sets them to 0 if they dont have any data during this time frame. Then it sorts this data based
 * on from a particular heading field and returns this JSON Object.
 *
 * @param  {JSON} data            Historical data of a particar type of type of Performace metric.
 * @param  {type} heading         The heading used to sort this data
 * @param  {type} startDate       The start date picked by the admin
 * @param  {type} endDate         The end date picked by the admin
 * @param  {type} userData        All possible merchants/users/items/paymentgateways
 * @param  {boolean} shallow = false This refers to the size of the data parameter passed in. Most of the historical data is a deep JSON file but some of them are not
 * @return {JSON}                 a JSON Object that contains sorted data on all merchants/users/items/paymentgateways within the selected timeframe.
 */
function getCumulative(data, heading, startDate, endDate, userData, shallow = false) {

    var startYear = startDate.getUTCFullYear();
    var startMonth = startDate.getMonth();
    var startDay = startDate.getDate();

    var endYear = endDate.getUTCFullYear();
    var endMonth = endDate.getMonth();
    var endDay = endDate.getDate();

		console.log("userData",userData);
		if (Object.keys(data).length)
		{
			var firstY = Object.keys(data)[0];
	    var firstM = Object.keys(data[firstY])[0];
	    var firstD = Object.keys(data[firstY][firstM])[0];
	    var firstGuy = Object.keys(data[firstY][firstM][firstD])[0];
			if (firstGuy)
			{
				var sample = data[firstY][firstM][firstD][firstGuy];
		    var keys = Object.keys(sample);
					var dataStructure = {};
			    for (var i = 0; i < keys.length; i++) {
			        var key = keys[i];
			        dataStructure[key] = !isNaN(sample[key]);
			    }

			    var cumulData = jQuery.extend(true, {}, userData);
			    //Iterating through all days between start date and end date
			    // Side Note: We realize we could have added a day to a date object and could have made this iteration much simpler,
			    // but we realized that too late and were too lazy change this code. Sorry
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
			                if (data[i] != null) {
			                    if (data[i][j] != null) {
			                        if (data[i][j][k] != null) {
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
			else
			{
				return {};
			}



		}
		else
		{
			return {}
		}


}

/**
 * getOptionsSelected - This function adds columns to the table data JSON variable and updates the table when the admin clicks save
 * options.
 *
 */
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


/**
 * addOptionsSelected - This function updates the JSON data of merchants or buyers and adds optional columns
 *
 * @param  {String} type This can be "Merchants","Buyers","Payemnts"."Items"
 * @return {JSON}      Table JSON data with added options
 */
function addOptionsSelected(type) {
    var newMerchantData = jQuery.extend(true, {}, currMerchData);
    var newBuyerData = jQuery.extend(true, {}, currBuyerData);
    var newPayData = jQuery.extend(true, {}, currPayData);
    var newItemData = jQuery.extend(true, {}, currItemData);
    for (var i = 0; i < selectedOptions[type].length; i++) {

        var newCol = opt[selectedOptions[type][i]]();
        if (type[0] == "M") {
            newMerchantData = addOption(newMerchantData, newCol, selectedOptions[type][i]);
        }
        else if (type[0] == "B") {
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

/**
 * addOption - This function takes in a JSON data, column data and heading name and returns a JSON
 * Object with added column.
 *
 * @param  {JSON} currData description
 * @param  {JSON} newCol   description
 * @param  {String} Heading  description
 * @return {type}          description
 */
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

/**
 * function to set the values of the check box inside the popup for columns inside performance reports
 */
function setCheckValues() {
    // setting the values for merchant options
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

    // setting the values for buyer options
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

/**
 * function which creates rankings table based on the data and ranks passed
 * @param {JSON} data data of merchants inputed
 * @param {Array} rank rankings of the merchants inputed
 */
function rankings(data, rank) {
    var returnData = {};

    var keys = Object.keys(data);
    var countTill = keys.length < rank ? keys.length : rank;


    for (var i = 0; i < countTill; i++) {
        returnData[keys[i]] = Object.assign({}, data[keys[i]]);
    }

    return returnData;
}




/**
 * calculate location for each merchant -@deprecated
 */
function calculateLocation() {
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

/**
 * converting null into empty string
 * @param {String} str string which needs to be handled
 * @returns {String} returns "" for null otherwise the input
 */
function handleNull(str) {
    if (str == null) {
        return "";
    }
    else {
        return str;
    }
}

/**
 * calculate the historical data for merchants, buyers, payment gateways and items for performance reports
 * @param {String} userType indicates the type of user whose historical data is needed
 * @returns {Array} an array of JSON consisting of the historical data of needed metrics
 */
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


/**
 * function to calculate all the metrics corresponding to users and merchants for performace reports
 */
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

    $.each(allUsers, function (index, user) {
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


/**
 * makes the data which is being displayed
 * @param {JSON} data JSON of the table data which is going to be tablized
 * @param {String} tableID name of the id given to the table which is going to be updated with the given data
 * @param {String} type tells where to append the number of results found
 * @param {Array} [sumBlackList=[]] black list which tells which metrics are not going to be added up
 * @param {Array} [groupings=false] an array of arrays which tells how to group the columns being tablized, leave empty if groupings are not needed while making the table
 */
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


/**
 * function to sort the data which is going to be made into the table
 * @param {JSON} data table data which is going to be sorted
 * @param {String} sortingKey column which is going to be used as the key parameter to be sorted
 * @returns {JSON]} table data of the sorted JSON according to the sortingKey selected
 */
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
/**
 * returns the 1st element of an array
 * @param {Array} array array which is taken as input
 * @returns {*} returns whatever the array has as members
 */
function getValue(array) {
    return array[1];
}

/**
 * function which carries out mergesort
 * @param {Array} array unsorted array
 * @returns {Array} sorted array
 */
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

/**
 * merge arrays
 * @param {Array} array1 first array to be merged
 * @param {Array} array2 second array to be merged
 * @returns {Array} the concatenated array
 */
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Global Variables used in the program

/**
 * An array of all the metrics for periodic reports
 * @type {Array}
 * @constant
 */
var metrics = ["Total-Users", "Total-Merchants", 'Gross-Merchandise-Value', 'Total-Admin-Commission', 'Total-Orders', 'Items-Refunded', 'Items-Sold', "Merchant-Buyer-Ratio", "Average-Revenue-Per-Merchant", "Average-Commission-Fee-Per-Merchant", "Guest-Registered-User-Ratio", "Total-Logins", "Average-Purchases-Per-Buyer", "Average-Order-Value"];

/**
 * An array of all optional metrics for periodic reports
 * @type {Array}
 * @constant
 */
var optionalMetrics = [metrics[4], metrics[6], metrics[5], metrics[7], metrics[8], metrics[9], metrics[10], metrics[12], metrics[13]];

/**
 * An array of all base metrics for periodic reports
 * @type {Array}
 * @constant
 */
var parameterList = [metrics[0], metrics[1], metrics[2], metrics[3]];
/**
 * An array of booleans which indicates the checked status of the metrics chosen in the settings table
 * @type {Array}
 */
var checkBoxStatus = [];
/**
 * An array containing all extra strings chosen in the options
 * @type {Array}
 */
var extra = [];
/**
 * Date Object indicating the start date picked in the start date datepicker
 * @type {Date}
 */
var startDateTime = false;
/**
 * Date object indicating the end date picked in the end date datepicker, by default set to currDay
 * @type {Date}
 */
var endDateTime = new Date();
/**
 * Date object referring to the current day
 * @type {Date}
 * @constant
 */
var currDay = new Date();
/**
 * JSON containing the historical data of all the metrics
 * @type {JSON}
 */
var allData;
/**
 * The format in which the periodic reports are being displayed, can be day, week, month, quarter, year
 * @type {String}
 */
var timeDisplayType = "day";
/**
 * Data in the form which can be displayed in the table
 * @type {JSON}
 */
var displayData;
/**
 * State variable which indicates whether periodic report/ performance report is selected
 * @type {String}
 */
var reportType;
/**
 * An array of arrays which indicates the different groups which are being grouped together
 * @type {Array}
 * @constant
 */
var metricGroupings = [
    [metrics[0], metrics[1], metrics[7], metrics[10], metrics[11]],
    [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]],
    [metrics[8], metrics[9], metrics[12], metrics[13]]
]
/**
 * An array mapping heading names to their explanations
 * @type {JSON}
 * @constant
 */
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
// TODO: adapt this function to work with page sized more than 1000 transactions
/**
 * function to get all the records of users
 * @returns {Array} an array of all the json objects of user information
 */
function getRecordsUserDetails() {

    adminID = document.getElementById("userGuid").value;

    var records;
    // making an API call to get the size of the total records
    var settings = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + token
        },
    };
    // getting the page size for the next api call
    var pageSize;
    $.ajax(settings).done(function (response) {
        pageSize = response.TotalRecords;
    });
    var settings2 = {
        "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
        "method": "GET",
        "async": false,
        "headers": {
            "Authorization": "Bearer " + token
        },
    };
    // records object which is going to be returned
    var records;
    $.ajax(settings2).done(function (response) {
        records = response.Records;
        return 0;
    });
    return records;
}

/**
 * return an array of all the transaction records inside the market place
 * @returns {Array} an array of all the json giving information of transactions
 */
function getRecordsTransactionHistory() {
    adminID = document.getElementById("userGuid").value;

    // baseURL = window.location.hostname;

    var transactionRecords = [];
    var count = 1;
    var length;
    // iterating through page numbers untill all the records have beent traversed through
    while (true) {
        var settings1 = {
            "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/transactions?pageSize=1000&pageNumber=" + count,
            "method": "GET",
            "async": false,
            "headers": {
                "Authorization": "Bearer " + token
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

/**
 * create a custom field inside the implementations and set the value of it
 * @param {String} cfName name of the custom field whose value needs to be set
 * @param {String} storedData value which is going to be stored inside a custom field
 * @param {JSON|boolean} cf a json object of the existing custom field, false if a custom field doesn't exist
 */
function createCfImplementations(cfName, storedData, cf) {
    var baseUrl = document.location.hostname;
    var adminID = document.getElementById("userGuid").value;

    // if the custom field already exists
    if (cf) {
        // body of the json used to make the custom field
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
        // settings of the api call being used to make the api call
        var settings1 = {
            "url": "https://" + baseUrl + "/api/v2/marketplaces",
            "method": "POST",
            // "async": false,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            "data": JSON.stringify(data)
        };

        $.ajax(settings1);

    }
    // if the custom field doesn't already exists
    else {
        // the json body to make the post request to make a custom field
        data = {
            "Name": cfName,
            "IsMandatory": true,
            "DataInputType": "textfield",
            "ReferenceTable": "Implementations",
            "DataFieldType": "string"
        }
        // settings used to make the post request to make the custom field
        var settings2 = {
            "url": "https://" + baseUrl + "/api/v2/admins/" + adminID + "/custom-field-definitions",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            // "async": false,
            "data": JSON.stringify(data)
        };
        // making the ajax call to make the custom field definition
        $.ajax(settings2).done(function (response) {
            cf = response;
            // body to update the newly made custom field
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
            // settings to update the value of the new custom field
            var settings3 = {
                "url": "https://" + baseUrl + "/api/v2/marketplaces",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                // "async": false,
                "data": JSON.stringify(data2)
            };
            // making the API call to make the new custom field
            $.ajax(settings3);
        });


    }

}

/**
 * to store in stringified version of the json in a custom field
 * @param {String} cfName the name of the custom field to store in the JSON data
 * @param {JSON} storedDataJSON JSON which is going to be stored in the custom field
 * @param {JSON|boolean} cf JSON of the existing custom field, false if it doesn't exist
 */
function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
    // calling the make custom fields function
    if (cfName == "loginCount") {
        console.log("login data stored succesfully");
    }
    createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
}

/**
 * retrieve the json of the stored stringified custom field
 * @param {String} cfName the string of the stored custom field
 * @returns {JSON|boolean} the JSON of the custom field if it exists it returns false if the custom field doesn't exist
 */
function retrieveCfValueJSON(cfName) {
    var baseUrl = document.location.hostname;
    // settings for the api call to return the custom field
    var settings1 = {
        "url": "https://" + baseUrl + "/api/v2/marketplaces",
        "method": "GET",
        "async": false,
        "headers": {
            "authorization": "Bearer " + token
        }

    }
    // setting all the marketplace custom fields
    var mpCustomFields = []
    $.ajax(settings1).done(function (response) {
        mpCustomFields = response.CustomFields;
    })
    // finding the required market place custom field
    var cf = null;
    for (i = 0; i < mpCustomFields.length; i++) {

        if (mpCustomFields[i]["Name"] == cfName) {
            cf = mpCustomFields[i];
        }
    }
    // parsing the json if it exists
    if (cf) {
        cf.Values[0] = JSON.parse(cf.Values[0]);
        return cf;
    }
    else {
        return false;
    }
}

/**
 * will return the table json of all the filtered data through the search
 * @param {Array} userRecords records of all the user data obtained from the api call
 * @param {JSON} tableData json data of the currently displaying table data
 * @param {String} input string search of what the admin types into the search bar
 * @returns {JSON} returns the JSON in the format suitable for the table to be called
 */
function searchBar(userRecords, tableData, input) {
    // data which is going to be queried
    var queryData = [];
    // count variable
    var count = 0
    // array of all user ids found inside the table
    var userIdArray = [];
    // array of user ids obtained from direct search on the table
    var requiredUsers1 = [];
    // array of user ids obtained from user records
    var requiredUsers2 = [];
    // params for the search
    var params = Object.keys(tableData[Object.keys(tableData)[0]]);
    // making the json into an array in order to use the fuse search functionality
    for (key in tableData) {
        queryData[count] = $.extend(true, {}, tableData[key]);
        queryData[count]["ID"] = key;
        userIdArray.push(key);
        count++;
    }
    // setting an additional search feature of full name
    for (i = 0; i < userRecords.length; i++) {
        userRecords[i].FullName = userRecords[i].FirstName + " " + userRecords[i].LastName;
    }
    // options for the fuse search
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
    // adding in additional keys from the parameters of the table being passed in
    options1.keys = options1.keys.concat(params);
    // // console.log(options1.keys);
    // fuse search along the table
    var fuse = new Fuse(queryData, options1);
    // fuse search along the user records
    var fuse2 = new Fuse(userRecords, options1);
    // results of the fuse searches
    var result1 = fuse.search(input);
    var result2 = fuse2.search(input);
    // pushing user ids of the fuse search into required users
    for (i = 0; i < result1.length; i++) {
        requiredUsers1.push(result1[i].item.ID);
    }
    // pushing user ids of all the fuse search into the user id array if it belongs to the table
    for (i = 0; i < result2.length; i++) {
        if (userIdArray.includes(result2[i].item.ID)) {
            requiredUsers2.push(result2[i].item.ID);
        };
    }
    // json being outputted
    var output = {};
    var requiredUsers = requiredUsers1.concat(requiredUsers2);
    // making the output
    for (i = 0; i < requiredUsers.length; i++) {
        output[requiredUsers[i]] = tableData[requiredUsers[i]];
    }
    return output;
}


/**
 * function to make each single graph
 * @param {JSON} tableData json containing the information of each table row
 * @param {Array} yLines array of the names of each y value
 * @param {String} xMarking the metric which is going to be used inside the x axis
 * @param {Node} chartNode the canvas element on which the chart is going to be graphed onto
 * @returns {Object} a chartjs chart object is returned
 */
function singleGraph(tableData, yLines, xMarking, chartNode) {
    var ctx = chartNode.getContext('2d');
    // settings for the graph which is going to be made
    var graphSettings = {
        "type": "line",
        "data": {
            "labels": [],
            "datasets": []
        },
        "options": {}
    };
    // pushing in all the xvalues which are going to be part of the graph
    for (key in tableData) {
        graphSettings.data.labels.push(tableData[key][xMarking]);
    }
    // pushing in all the y values which are going to be graphed out
    for (i = 0; i < yLines.length; i++) {
        var currDataSet = {
            'label': yLines[i],
            'borderColor': 'rgb(' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ',' + String(Math.round(Math.random() * 255)) + ')',
            'data': []
        };
        // pushing in each individual point into the graph
        for (key in tableData) {
            currDataSet.data.push(tableData[key][yLines[i]]);
        }
        // pushing the data set into the graph settings
        graphSettings.data.datasets.push(currDataSet);
    }
    // returning the graph which can be assigned to other elements
    return (new Chart(ctx, graphSettings));
}

/**
 * function to make graphs of all the respective graphs sorted by different categories
 */
function groupGraphs() {
    // getting the graph elements
    graphDiv = document.getElementById("graphs");
    graphDiv.innerHTML = "";
    // getting the groupings as an array
    groupings = getGrouping(parameterList.concat(extra));
    // iterating through the graphs and appending them to the canvas
    for (let i = 1; i < groupings.length; i++) {
        let currCanvas = document.createElement("canvas");
        graphDiv.appendChild(currCanvas);
        if (groupings[i].length) {
            singleGraph(displayData, groupings[i], groupings[0], currCanvas);
        }
    }

}
/**
 * to switch the table div around and display the graph
 */
function flipGraph() {
    // check if the div with class flipper has the flip class and swap the flip class if it doesn't have it
    if ($(".flipper").hasClass("flip")) {
        $(".flipper").removeClass("flip");
        $(".front").removeClass("hide");
    }
    else {
        $(".flipper").addClass("flip");
        $(".front").addClass("hide");
        // make the multiple graphs if the button to visualize was clicked
        groupGraphs();
    }
}

/**
 * iterate through the checkboxes inside the settings popup and
 */
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

/**
 * setting the checkboxvalues to the values saved in the checked options
 */
function setCheckBoxValues() {
    // finding the popup element
    var popUp = document.getElementById("popUpTime");
    var checkBoxes = popUp.getElementsByClassName('fancy-checkbox');
    // iterating through all the checkboxes and setting the checkstatus to true if the value is stored in the array
    for (i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].childNodes[1].checked = checkBoxStatus[i];
    }
}
/**
 * make a csv and download it onto the user's client
 * @param {JSON} rankTable the table data for the performance table
 * @param {JSON} timeTable the table data for the periodic table
 * @param {JSON} type the type of table being currently displayed
 */
function retCSV(rankTable, timeTable, type) {
    // setting the respective value
    if (type == "rank") {
        tableDataJson = rankTable;
    } else {
        tableDataJson = timeTable;
    }
    // check if there is any displaying data
    if (tableDataJson) {
        // making the csv string and escaping all the necessary characters
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
        // making the download link
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

/**
 * calculating all the necessary user data
 * @param {Array} records array of all the user data records
 * @param {Array} [metricsArray] a list of metrics which needs to be caluclated
 * @returns {JSON} JSON data which needs to be returned
 */
function retUserData(records, metricsArray = [metrics[0], metrics[1], metrics[7]]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {}
    }
    // iterating through all the records and calculating the data
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
    // calculating the ratio data
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

/**
 * gives an array of JSON of all the calulated time data
 * @param {Array} transactionRecords array of all the transactions which nee
 * @param {Array} metricsArray array of all the metrics to be calculated
 * @returns {JSON} array of json of all the calculated values
 */
function retTransactionData(transactionRecords, metricsArray = [metrics[2], metrics[3], metrics[4], metrics[5], metrics[6]]) {
    monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }
    // iterating through the transaction records and calculating all the metrics
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
        // gross merchandise value calculations
        if (monthWise[metrics[2]]) {
            merchValue = Number(transactionRecords[i].Fee) + Number(transactionRecords[i].Total);
            monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += merchValue / transactionRecords[i].Orders[0].PaymentDetails.length;
            monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[2]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
        }
        // admin commission fee calculation
        if (monthWise[metrics[3]]) {
            monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Fee / transactionRecords[i].Orders[0].PaymentDetails.length;
            monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] = Math.round(monthWise[metrics[3]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] * 100) / 100;
        }
        // total number of orders
        if (monthWise[metrics[4]]) {
            monthWise[metrics[4]][dt.getUTCFullYear()][dt.getUTCMonth()][dt.getDate()] += transactionRecords[i].Orders.length;
        }
        // calculating things inside the orders
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

/**
 * calculating data for the ratio elements
 * @param {Array} userRecords an array of all the user records
 * @param {Array} transactionRecords an array of all the transaction records
 * @param {Array} metricsArray an array of all the metrics which are going to be calculated
 * @returns {JSON} returns an array of all the average merchant values
 */
function calculateRatio(userRecords, transactionRecords, metricsArray = [metrics[8], metrics[9]]) {
    var monthWise = {};
    for (i = 0; i < metricsArray.length; i++) {
        monthWise[metricsArray[i]] = {};
    }
    // getting information time information about the merchants
    processedUserData = retUserData(userRecords, [metrics[1]]);

    // calculating for the first function
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
    // calculating for the second function
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

/**
 * function which returns an array of all the transaction details
 * @param {Array} transactionRecords an array of records of all the transaction records
 * @returns {JSON} json of all time dependent transaction data
 */
function calculateTransactions(transactionRecords) {
    output = {};
    // finding the number of transactions indexed to the history of the marketplace
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
    // fill in the month data and return the output
    return fillInMonth(output);
}

/**
 * function to calculate the average number of purchases per buyer in a marketplace
 * @param {JSON} transactions JSON of all the time dependent transactions in a marketplace
 * @param {JSON} buyer JSON of all the historical data of buyers who joined the marketplace
 * @returns {JSON} returns a JSON object of the historical data of average purchases per buyer
 */
function calculateAveragePurchasesPerBuyer(transactions, buyer) {
    var output = {};
    // iterating through transactions and buyers and calculating the necessary details
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

/**
 * calculate the historical data for the average value of each order made in the marketplace
 * @param {JSON} grossMerchandiseValue JSON containing historical data of the GrossMerchandiseValue
 * @param {JSON} transactions JSON containing the historical data of all transactions
 * @returns {JSON} returns a JSON containing the historical data of all the orders
 */
function calculateAverageOrderValue(grossMerchandiseValue, transactions) {
    var output = {};
    // iterating through the transactions and gross merchandisvalue to calculate the average order value
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
/**
 * function to generate an array of arrays containing all the metrics which have been grouped into respective groups according to the group
 * @param {Array} metrics
 * @returns an array of array with all the respective groups
 */
function getGrouping(metrics) {
    var output = [];
    // checking with the global variables and pushing in only the required variables into the respective groupings
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

/**
 * calculate the ratio of purchases made by guests to registered users(GRU)
 * @param {JSON} transactionRecords array of JSON containing all transaction details
 * @returns {JSON} contains JSON of all the historical data of the number of purchases made by guests to registered users
 */
function calculateRatioRegisteredBuyers(transactionRecords) {
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
    // iterate through all purchases and make api calls to check if the user is a registered user or not and then add values to the required fields
    for (i = 0; i < transactionRecords.length; i++) {
        for (j = 0; j < transactionRecords[i].Orders.length; j++) {
            for (k = 0; k < transactionRecords[i].Orders[j].PaymentDetails.length; k++) {
                if (transactionRecords[i].Orders[j].PaymentDetails[k].InvoiceNo == transactionRecords[i].InvoiceNo) {
                    var cTime = new Date(transactionRecords[i].Orders[j].PaymentDetails[k].DateTimeCreated * 1000);
                    // if the time of the transaction is greater than the stored time in the GRU JSON then don't make an api call
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

/**
 * make the JSON data for displaying the number of logins
 * @param {JSON} loginData JSON data of the historical data of all the logins\
 * @returns {JSON} data made into displayable format
 * @deprecated
 */
function displayLoginCount(loginData) {
    // manipulating the login data to the required format
    console.log("login data", loginData);
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
    output = {};
    // iterating through login data and adding up the values
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
    // filling in years from the start year
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
    // fill in years with blank data
    out = fillInYear(output, new Date(marketplaceStartDate));
    console.log("out", out);
    return out;
}

/**
 * converts data from month specific data into cumulative data
 * @param {JSON} monthSpecificData takes in daily data of required metric
 * @returns {JSON} returns cumulative data of the above
 */
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

/**
 * function to take in a JSON of all the month specific data and convert into cumulative data going from particular start date to an end date
 * @param {JSON} msData historical data of all metrics mapped into historical data
 * @param {Date} startDate start of historical data
 * @param {Date} endDate end of historical data
 * @param {Array} options options to check if a particular key should be iterated through correctly
 * @returns {JSON} cumulative historical data JSON
 */
function cumDataConverter(msData, startDate, endDate, options) {
    // declaring all the data which needs to be just added and all the data which needs to be added in and divided
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
    // iterating through all the keys and all the years, months and days in order to calculate all the cumulative data
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

/**
 * if a month doesn't exist fill it in with blank data
 * @param {JSON} timeData JSON which needs to be filled in
 * @returns {JSON} json with filled in months
 */
function fillInMonth(timeData) {
    // filling in months
    for (year in timeData) {
        for (i = 0; i < 12; i++) {
            if (!timeData[year][i]) {
                timeData[year][i] = {};
            }
        }
    }
    return timeData;
}

/**
 * fill in all the years from the starting of the market place
 * @param {JSON} timeData JSON of historical data
 * @param {Date} startMarketPlace date of the starting of the marketplace
 * @returns {JSON} the JSON containing the filled in historical
 */
function fillInYear(timeData, startMarketPlace) {
    var startYear = startMarketPlace.getFullYear();
    for (i = startYear; i < currDay.getFullYear(); i++) {
        if (!timeData[i]) {
            timeData[i] = {};
        }
    }
    return fillInMonth(timeData);
}

/**
 * function to add in help bars over header tags in the tables
 */
function addHelp() {
    // finding all the header tags
    var headings = document.getElementsByTagName("th");
		if (currState == "Merchants")
		{
			helpDict["Rank"] = "Indicates the rank of the merchant based on the total revenue earned by him";
			helpDict["Name"] = "Name of the merchant";
			helpDict["Email"] = "Email of the merchant ";
			helpDict["Total Revenue"] = "The total amount of money made by the merchant";
			helpDict["Number of Orders"] = "Total number of transactions the merchant has been involved in";
			helpDict["Total Admin Commission"] = "Total commission earned by the admin in transactions of the merchant";
		}
		else if (currState == "Buyers")
		{
			helpDict["Rank"] = "Indicates the rank of the buyer based on the total amount of money spent ";
			helpDict["Name"] = "Name of the buyer";
			helpDict["Email"] = "Email of the buyer";
			helpDict["Total Money Spent"] = "Total money spent by the buyer in the specific time frame";
			helpDict["Number of Orders"] = "The total number of orders involving the buyer and a different seller";
			helpDict["Total Admin Commission"] = "Total commission earned by the admin in transactions involving the buyer";
		}
		else if (currState == "Payment Gateways")
		{
			helpDict["Rank"] = "Indicates the rank of the payment gateway based on the total amount of money transferred";
			helpDict["Name"] = "Name of the payment gateway";
			helpDict["Money Transferred"] = "Total amount of money transferred through the payment gateway";
			helpDict["Admin Commission Earned"] = "Admin commission earned by the admin in the transactions which occur through the payment gateway";
		}
		else
		{
			helpDict["Rank"] = "Indicates the rank of the item based on the total number of transactions involved";
			helpDict["Name"] = "Name of the item being ranked";
			helpDict["Number of Transactions"] = "The total number of unique transactions the item is involved in";
			helpDict["Total Money Spent"] = "The total amount of money spent by the buyers on purchasing this particular item";
			helpDict["Total Quantity Bought"] = "The total quantity of this item bought by all the buyers";
			helpDict["Seller"] = "The seller selling this particular item";
		}
    // iterating through all of them and adding in the explanations over them
    for (var i = 0; i < headings.length; i++) {
        var heading = headings[i];
        var help = document.createElement("span");
        // making the required explanation tag and appending them to the header tag and appeding it over
        help.className = "tooltiptext";
        if (heading.firstElementChild != null) {
            if (helpDict[heading.firstElementChild.innerText]) {
                help.innerHTML = helpDict[heading.firstElementChild.innerText];
            }
            else {
                help.innerHTML = "description will be added in later";
            }
        }
        heading.appendChild(help);
        heading.style.zIndex = 0;
    }
}

/**
 * return the number of days in a particular month in a year
 * @param {Number} year the year
 * @param {Number} month the month
 * @returns {Number} number of days in a month
 */
function getMonthDays(year, month) {
    // JSON of all days corresponding to months
    var monthDays = { 0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30, 6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31 };
    // accounting for leap year
    if (year % 4 == 0 && month == 1 && year % 100 != 0 || (year % 400 == 0 && month == 1)) {
        return 29;
    }
    else {
        return monthDays[month];
    }
}

/**
 * function to make the different types of display daa
 * @param {JSON} inputData JSON data which is going to be converted into table displayable format
 * @param {String} type string which is the type of display data, like "quarterly","monthly","daily"...
 * @returns {JSON} displayable table data in the required type
 */
function makeDisplayData(inputData, type) {
    var outputData = {};
    // making daily display data
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
    // weekly data
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
    // monthly data
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
    // quarterly data
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
    // yearly data
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

/**
 * function to make display data for dispaying guest to registered purchase data
 * @param {JSON} timeData JSON of historical metric data
 * @returns {JSON} returns the displayable form of the data
 */
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
    var multicurrency = true;
    for (var i = 0; i < records.length; i++) {
        var invoice = records[i];
        if (i == 0) {
            currencies.push(currency);
        }

        else if (currencies.indexOf(invoice["CurrencyCode"]) == -1) {
            currencies.push(invoice["CurrencyCode"]);
            multicurrency = true;
        }

    }
    if (multicurrency) {
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
