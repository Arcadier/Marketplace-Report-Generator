// var token = "uEkKTaXW_2yEhozCq_3sZoHCejLrayLqr52y5nsJzbYU1mOxv5ZN3pQiXNFCgOv8pjo2eVOVZIbkTOrJI-A20frzAeoGHsvwjNeFRoqR7CnddbVTFmelVS7T77IkA03Nsox55s5Or4fcRC-cGElecx62P4pHRIPeUsapV8IJC43ANNfhsmyxi3mUPwDmVO5YNDQqkDJ40RxlIvxRbu03G68x7_Clp4Ha5kqAiQ6JfmGdP7fYxC9gW6tzQgKzIu-5Zga2rJxH5Aql81hK2wR7rP-lwq3UAQ618qIR-TocgLTQRlVLA45SsGgKMjBFnvTGeGIepR9yJQA1Ivs2I0SiMREiRSwSbWytXg7Oc6JbEnWj3-MPG9EHQU6XHDTC8m63-bYQvSR_qiSvanIsvUWUVCtQT-T_gTyEXxs7pQ13L3MXAkBlh5vM-_pOLy92Dx5YJ7RQzzhiBFOEj-BFl_meztPLeLa3k2Gtl7FNOtdtFNW1K_3arwryRmMyI1baby4Gu7xDb1lPuQsbMSHMMD1uyKmJJPKEGaRXGvQ2-CrSmvgVfiJwEMCyxwpSSczsTWHJnkbPCATbAGq-6hv03_z4aLYlSLRUl2bJgGGbYxSmuzcpVzoN12xvLKpwGUtqLvl60euGDxVJeEuUW0zmlcyncehQSC2svk59xsS8M1yQCsDkPpJ0OVDNxahCtdVrhQPLvV2nD6TF3jtBu2_JHzNpyyuQqBDg_42viud2n5SJ8l0VTuni2lz595isf5ZbhBqcX5HNahykusy9l2ozMpGL4WfMajhk5gqgkL2O8FO7mQT-HWMffbwsO8zmVsF4Jb1CGJC18NCozaKzn-uzbCndnRcyHLWxocPMEOYBnvrbIWMpqPHl";
// var baseURL = "forgottentoy.test.arcadier.io";

var baseURL = window.location.hostname;
var token = getCookie('webapitoken');

var adminID;
// var CORS = "cors-anywhere.herokuapp.com/";
var CORS = "";
var keyName = { "Merchant": "Total Revenue", "User": "Total Money Spent" };
var transactionName = { "Merchant": "Payee", "User": "Payer" };
var MerchantHistory;
var UserHistory;
var MerchantCumilHistory;
var BuyerCumilHistory;
var MerchantselectedDate;
var BuyerselectedDate;
var MerchantMonthData;
var BuyerMonthData;
var OptionMerchantMonthData;
var OptionBuyerMonthData;
var PaymentHistory;
var locationData;
var MerchantdateSelected = false;
var BuyerdateSelected = false;
var selectedOptions = { "MerchantOptions": [], "BuyerOptions": [] };
var displayedMerchantData;
var displayedBuyerData;
var merchantdataType = "Month Specific";
var buyerdataType = "Month Specific";
var opt = { "Payment Gateway": getPaymentGateway, "Location": getLocation };

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

$(document).ready(function () {
  adminID = document.getElementById("userGuid").value;
  MerchantHistory = setHistoricalData("Merchant");
  BuyerHistory = setHistoricalData("User");
  PaymentHistory = setPaymentGateway();
  locationData = setLocation("User");
  MerchantCumilHistory = getCumulative(MerchantHistory, "Merchant");
  BuyerCumilHistory = getCumulative(BuyerHistory, "User");
  var megaDataDict = { "Month Specific": { "Merchant": MerchantHistory, "Buyer": BuyerHistory }, "Cumulative": { "Merchant": MerchantCumilHistory, "Buyer": BuyerCumilHistory } };

  // console.log(MerchantCumilHistory);
  // console.log(BuyerCumilHistory);

  $("#dateStartPickerMerchant").on('changeDate', function (selected) {
    MerchantdateSelected = true;
    var MerchantTopRanks = document.getElementById("MerchantRankings");
    MerchantselectedDate = new Date(selected.date.valueOf() + 1300000000);
    MerchantMonthData = megaDataDict[merchantdataType]["Merchant"][MerchantselectedDate.getUTCFullYear()][MerchantselectedDate.getMonth()];
    // console.log(MerchantMonthData);
    nMerchants = Object.keys(MerchantMonthData).length;
    updateRankings(nMerchants, MerchantTopRanks, "All Merchants");
    var rank = document.getElementById("MerchantChosenRanking").innerHTML.split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity
    }
    else {
      rank = parseInt(rank);
    }
    OptionMerchantMonthData = addOptionsSelected("MerchantOptions");
    displayedMerchantData = rankings(OptionMerchantMonthData, rank);

    updateFrontEnd(displayedMerchantData, "MerchantTable");
    // console.log("Merchant Date Picked", rankedData);
  });

  $("#dateStartPickerBuyer").on('changeDate', function (selected) {
    BuyerdateSelected = true;
    var BuyerTopRankings = document.getElementById("BuyerRankings");
    BuyerselectedDate = new Date(selected.date.valueOf() + 1300000000);
    BuyerMonthData = megaDataDict[buyerdataType]["Buyer"][BuyerselectedDate.getUTCFullYear()][BuyerselectedDate.getMonth()];
    nBuyers = Object.keys(BuyerMonthData).length;
    updateRankings(nBuyers, BuyerTopRankings, "All Buyers");
    var rank = document.getElementById("BuyerChosenRanking").innerHTML.split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity
    }
    else {
      rank = parseInt(rank);
    }
    OptionBuyerMonthData = addOptionsSelected("BuyerOptions");
    displayedBuyerData = rankings(OptionBuyerMonthData, rank);

    updateFrontEnd(displayedBuyerData, "BuyerTable");
    // console.log("Buyer Date Picked", rankedData);
  });

  $("#merchantDataType li a").click(function () {
    merchantdataType = $(this).text();

    var mega = megaDataDict[merchantdataType]["Merchant"];

    if (MerchantdateSelected) {
      MerchantMonthData = mega[MerchantselectedDate.getUTCFullYear()][MerchantselectedDate.getMonth()];
      var MerchantTopRanks = document.getElementById("MerchantRankings");
      var rank = document.getElementById("MerchantChosenRanking").innerHTML.split(' ')[1];
      nMerchants = Object.keys(MerchantMonthData).length;
      updateRankings(nMerchants, MerchantTopRanks, "All Merchants");
      if (isNaN(rank)) {
        rank = Infinity
      }
      else {
        rank = parseInt(rank);
      }
      OptionMerchantMonthData = addOptionsSelected("MerchantOptions");
      displayedMerchantData = rankings(OptionMerchantMonthData, rank);

      updateFrontEnd(displayedMerchantData, "MerchantTable");
    }

  });

  $("#buyerDataType li a").click(function () {
    buyerdataType = $(this).text();
    var mega = megaDataDict[buyerdataType]["Buyer"];

    if (BuyerdateSelected) {
      BuyerMonthData = mega[BuyerselectedDate.getUTCFullYear()][BuyerselectedDate.getMonth()];
      var BuyerTopRankings = document.getElementById("BuyerRankings");
      nBuyers = Object.keys(BuyerMonthData).length;
      updateRankings(nBuyers, BuyerTopRankings, "All Buyers");
      var rank = document.getElementById("BuyerChosenRanking").innerHTML.split(' ')[1];
      if (isNaN(rank)) {
        rank = Infinity
      }
      else {
        rank = parseInt(rank);
      }
      OptionBuyerMonthData = addOptionsSelected("BuyerOptions");
      displayedBuyerData = rankings(OptionBuyerMonthData, rank);

      updateFrontEnd(displayedBuyerData, "BuyerTable");
    }
  });

  var popUp = document.getElementById("popUpTime");
  var checkBoxes = popUp.getElementsByClassName('fancy-checkbox')
  for (i = 0; i < checkBoxes.length; i++) {
    checkBoxStatus[i] = false;
  }
  startOfProgramTime();
  unformattedJSON = retData(parameterList.concat(extra));
  unformattedJSONcum = massCumulativeDataTime(parameterList.concat(extra));
  unformattedJSONcum = retData(unformattedJSONcum, false);
  keys = Object.keys(unformattedJSONcum);
  startYearMarket = keys[0];
  for (innerKey in unformattedJSONcum[startYearMarket]) {
    if (unformattedJSONcum[startYearMarket][innerKey]['User'] != 0) {
      startMonthMarket = innerKey;
      break;
    }
  }

  $("#t-dateStartPicker").on('changeDate', function (selected) {
    if (selected.date.getFullYear() > startYearMarket || selected.date.getFullYear() == startYearMarket && selected.date.getMonth() > startMonthMarket) {
      startMonthTime = selected.date.getMonth();
      startYearTime = selected.date.getFullYear();
    }
    else {
      startMonthTime = startMonthMarket;
      startYearTime = startYearMarket;
    }
    formattedJSON = retDisplayData(unformattedJSON, startMonthTime, startYearTime, endMonthTime, endYearTime);
    updateFrontEnd(formattedJSON, 'TimeTable');
  })


  $("#t-dateEndPicker").on("changeDate", function (selected) {
    if ((selected.date.getFullYear() < currDay.getFullYear()) || (selected.date.getFullYear() == currDay.getFullYear() && selected.date.getMonth() <= currDay.getMonth())) {
      endMonthTime = selected.date.getMonth();
      endYearTime = selected.date.getFullYear();
    }
    else {
      endMonthTime = currDay.getMonth();
      endYearTime = currDay.getFullYear();
    }
    if (monthArray[startMonthTime]) {
      formattedJSON = retDisplayData(unformattedJSON, startMonthTime, startYearTime, endMonthTime, endYearTime);
      updateFrontEnd(formattedJSON, 'TimeTable');
    }

  })
  $("#cumDatePicker").on('changeDate', function (selected) {
    dateCumMonth = selected.date.getMonth();
    dateCumYear = selected.date.getFullYear();
    formattedJSONcum = retDisplayData(unformattedJSONcum, startMonthMarket, startYearMarket, dateCumMonth, dateCumYear);
    updateFrontEnd(formattedJSONcum, 'TimeTable');

  })

});

function getCumulative(data, userType) {
  var cumilData = jQuery.extend(true, {}, data);

  var years = Object.keys(cumilData);
  var firstMonth = Object.keys(cumilData[years[0]])[0];
  var prevData = jQuery.extend(true, {}, cumilData[years[0]][firstMonth]);

  var headings = Object.keys(prevData);

  for (user in prevData) {
    delete prevData[user]["Rank"];
    for (heading in prevData[user]) {

      if (!isNaN(prevData[user][heading])) {
        prevData[user][heading] = 0;
      }
    }
  }


  for (year in cumilData) {
    for (month in cumilData[year]) {
      for (user in prevData) {

        if (cumilData[year][month][user] != null) {
          delete cumilData[year][month][user]["Rank"];
          for (heading in cumilData[year][month][user]) {
            if (!isNaN(cumilData[year][month][user][heading]) && heading != "Rank") {
              cumilData[year][month][user][heading] += prevData[user][heading];
              cumilData[year][month][user][heading] = Math.round(cumilData[year][month][user][heading] * 100) / 100;
            }

          }
        }
        else {
          cumilData[year][month][user] = Object.assign({}, prevData[user]);
        }

      }

      for (user in cumilData[year][month]) {
        if (cumilData[year][month][user]["Rank"] != null) {
          delete cumilData[year][month][user]["Rank"];
        }
      }
      prevData = jQuery.extend(true, {}, cumilData[year][month]);

    }
  }
  if (userType != null) {
    for (year in cumilData) {
      for (month in cumilData[year]) {
        cumilData[year][month] = sortData(cumilData[year][month], keyName[userType]);
      }
    }
  }

  return cumilData;
}

function getOptionsSelected() {
  var Merchselected = [];
  var options = document.getElementById("merchant-options").getElementsByClassName("fancy-checkbox");

  for (var i = 0; i < options.length; i++) {
    if (options[i].childNodes[1].checked) {
      Merchselected.push(options[i].childNodes[2].childNodes[0].innerHTML);
    }
  }

  var Buyerselected = [];
  var options = document.getElementById("buyer-options").getElementsByClassName("fancy-checkbox");

  for (var i = 0; i < options.length; i++) {
    if (options[i].childNodes[1].checked) {
      Buyerselected.push(options[i].childNodes[2].childNodes[0].innerHTML);
    }
  }


  selectedOptions = { "MerchantOptions": Merchselected, "BuyerOptions": Buyerselected };
  // console.log(selectedOptions);

  if (MerchantdateSelected) {
    OptionMerchantMonthData = addOptionsSelected("MerchantOptions");
    var rank = document.getElementById("MerchantChosenRanking").innerHTML.split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity
    }
    else {
      rank = parseInt(rank);
    }
    displayedMerchantData = rankings(OptionMerchantMonthData, rank);
    updateFrontEnd(displayedMerchantData, "MerchantTable");
  }
  if (BuyerdateSelected) {
    OptionBuyerMonthData = addOptionsSelected("BuyerOptions");
    var rank = document.getElementById("BuyerChosenRanking").innerHTML.split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity
    }
    else {
      rank = parseInt(rank);
    }
    displayedBuyerData = rankings(OptionBuyerMonthData, rank);
    updateFrontEnd(displayedBuyerData, "BuyerTable");
  }
}

function addOptionsSelected(type) {
  var newMerchantData = jQuery.extend(true, {}, MerchantMonthData);
  var newBuyerData = jQuery.extend(true, {}, BuyerMonthData);
  for (var i = 0; i < selectedOptions[type].length; i++) {
    var newCol = opt[selectedOptions[type][i]]();
    if (type[0] == "M") {
      // displayedMerchantData = addOption(displayedMerchantData,newCol,selectedOptions[type][i]);
      newMerchantData = addOption(newMerchantData, newCol, selectedOptions[type][i]);
    }
    else {
      // displayedBuyerData = addOption(displayedBuyerData,newCol,selectedOptions[type][i]);
      newBuyerData = addOption(newBuyerData, newCol, selectedOptions[type][i]);
    }
  }

  if (type[0] == "M") {
    return newMerchantData;
  }
  else {
    return newBuyerData;
  }
}



function addOption(currData, newCol, Heading) {
  var retData = {};
  var keys = Object.keys(currData);
  for (var i = 0; i < keys.length; i++) {
    var curr = currData[keys[i]];
    // console.log(newCol[keys[i]]);
    if (newCol[keys[i]] == null) {
      curr[Heading] = "Deleted Data";
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

  for (var i = 0; i < options.length; i++) {
    if (selectedOptions["MerchantOptions"].indexOf(options[i].childNodes[2].childNodes[0].innerHTML) > -1) {
      options[i].childNodes[1].checked = true;
    }
    else {
      options[i].childNodes[1].checked = false;
    }
  }

  var options = document.getElementById("buyer-options").getElementsByClassName("fancy-checkbox");

  for (var i = 0; i < options.length; i++) {
    if (selectedOptions["BuyerOptions"].indexOf(options[i].childNodes[2].childNodes[0].innerHTML) > -1) {
      options[i].childNodes[1].checked = true;
    }
    else {
      options[i].childNodes[1].checked = false;
    }
  }
}

function updateRankings(num, list, type) {

  list.innerHTML = "";

  var topString = type;
  var link = document.createElement("a");
  link.innerHTML = topString;
  var id = "rank-t-all";
  link.id = id;

  var li = document.createElement("li");
  li.appendChild(link);
  list.appendChild(li);
  // console.log(list);
  var start = 5;
  for (i = start; i <= num; i += 5) {
    var topString = "Top " + i;
    var link = document.createElement("a");
    link.innerHTML = topString;
    var id = "rank-t-" + i;
    link.id = id;

    var li = document.createElement("li");
    li.appendChild(link);
    list.appendChild(li);
  }
  $("#MerchantRankings li a").click(function () {
    rank = $(this).text().split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity
    }
    else {
      rank = parseInt(rank);
    }


    if (MerchantdateSelected) {
      displayedMerchantData = rankings(OptionMerchantMonthData, rank);
      updateFrontEnd(displayedMerchantData, "MerchantTable");
    }
    // console.log("Merchant changed rank",rankedData);
  });
  $("#BuyerRankings li a").click(function () {
    rank = $(this).text().split(' ')[1];
    if (isNaN(rank)) {
      rank = Infinity;
    }
    else {
      rank = parseInt(rank);
    }

    if (BuyerdateSelected) {
      displayedBuyerData = rankings(OptionBuyerMonthData, rank);
      updateFrontEnd(displayedBuyerData, "BuyerTable");
    }
    // console.log("Buyer changed rank",rankedData);
  });

}

function rankings(data, rank) {
  var returnData = {};

  var keys = Object.keys(data);
  var countTill = keys.length < rank ? keys.length : rank;
  // console.log(countTill);
  // console.log(keys.length);
  // console.log(rank);

  for (var i = 0; i < countTill; i++) {
    returnData[keys[i]] = Object.assign({}, data[keys[i]]);
  }
  // console.log(returnData);
  return returnData;
}

function setHistoricalData(userType) {
  var HistoricalData;
  var reqData;
  var cfName = userType.toLowerCase() + "defaulthistory";
  var settings = {
    "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings).done(function (response) {
    var cfs = response["CustomFields"];
    $.each(cfs, function (index, cf) {
      if (cf["Name"] == cfName) {
        reqData = JSON.parse(cf["Values"][0]);
      }
    })
  });

  if (reqData) {
    HistoricalData = reqData;
  }

  else {
    HistoricalData = calculateHistoricalData(userType);
    var cfData =
    {
      "Name": cfName,
      "DataInputType": "textfield",
      "ReferenceTable": "Implementations",
      "DataFieldType": "string",
      "IsMandatory": true,
      "IsSearchable": true
    };

    var settingstest = {
      "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/custom-field-definitions",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      "data": JSON.stringify(cfData)
    };

    $.ajax(settingstest).done(function (response) {

      // console.log(response);
      var historyCf = {
        "CustomFields": [
          {
            "Code": response["Code"],
            "Values": [
              JSON.stringify(HistoricalData)
            ]
          }
        ]
      };

      var settings3 = {
        "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        "data": JSON.stringify(historyCf)
      };

      $.ajax(settings3).done(function () {
        console.log("Stored CF Successfully");
      });
    });

    // var years = Object.keys(HistoricalData);
    // var latestYear = years[years.length-1];
    //
    // var months = Object.keys(HistoricalData[latestYear]);
    // var latestMonth = months[months.length-1];
    //
    // var currDate = new Date();

    // for (var i = latestYear; i<=currDate.getUTCFullYear(); i++)
    // {
    //   for (var j = latestMonth; j<=currDate.getMonth)
    // }


  }
  return HistoricalData;
}

function setLocation(userType) {
  var cfName = userType + "locationhistory";
  var reqData = false;
  var HistoricalData;
  var settings = {
    "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings).done(function (response) {
    var cfs = response["CustomFields"];
    $.each(cfs, function (index, cf) {
      if (cf["Name"] == cfName) {
        reqData = JSON.parse(cf["Values"][0]);
      }
    })
  });

  if (reqData) {
    HistoricalData = reqData;
  }
  else {
    HistoricalData = calculateLocation(userType);
    var cfData =
    {
      "Name": cfName,
      "DataInputType": "textfield",
      "ReferenceTable": "Implementations",
      "DataFieldType": "string",
      "IsMandatory": true,
      "IsSearchable": true
    };

    var settingstest = {
      "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/custom-field-definitions",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      "data": JSON.stringify(cfData)
    };

    $.ajax(settingstest).done(function (response) {

      // console.log(response);
      var historyCf = {
        "CustomFields": [
          {
            "Code": response["Code"],
            "Values": [
              JSON.stringify(HistoricalData)
            ]
          }
        ]
      };

      var settings3 = {
        "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        "data": JSON.stringify(historyCf)
      };

      $.ajax(settings3).done(function () {
        console.log("Stored CF Successfully");
      });
    });
  }

  return HistoricalData;
}

function calculateLocation(userType) {
  var locationData = {};
  var pageSize;
  var settings2 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings2).done(function (response) {
    pageSize = response["TotalRecords"];
  });

  var settings4 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings4).done(function (response) {
    var users = response["Records"];
    $.each(users, function (index, user) {


      var userID = user["ID"];
      locationData[userID] = [];
      var settings3 = {
        "url": "https://" + CORS + baseURL + "/api/v2/users/" + userID + "/addresses",
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
function setPaymentGateway() {
  var cfName = "paymentgatewayhistory";
  var reqData = false;
  var HistoricalData;
  var settings = {
    "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings).done(function (response) {
    var cfs = response["CustomFields"];
    $.each(cfs, function (index, cf) {
      if (cf["Name"] == cfName) {
        reqData = JSON.parse(cf["Values"][0]);
      }
    })
  });

  if (reqData) {
    HistoricalData = reqData;
  }
  else {
    HistoricalData = calculatePaymentGateway();
    var cfData =
    {
      "Name": cfName,
      "DataInputType": "textfield",
      "ReferenceTable": "Implementations",
      "DataFieldType": "string",
      "IsMandatory": true,
      "IsSearchable": true
    };

    var settingstest = {
      "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/custom-field-definitions",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      "data": JSON.stringify(cfData)
    };

    $.ajax(settingstest).done(function (response) {

      // console.log(response);
      var historyCf = {
        "CustomFields": [
          {
            "Code": response["Code"],
            "Values": [
              JSON.stringify(HistoricalData)
            ]
          }
        ]
      };

      var settings3 = {
        "url": "https://" + CORS + baseURL + "/api/v2/marketplaces",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        "data": JSON.stringify(historyCf)
      };

      $.ajax(settings3).done(function () {
        console.log("Stored CF Successfully");
      });
    });
  }

  return HistoricalData;
}

function calculatePaymentGateway() {
  var allMerchants = [];
  var pageSize;
  var payInfo;
  var paymentData = {};
  var settings3 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/payment-gateways/?pageSize=1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };
  $.ajax(settings3).done(function (response) {
    pageSize = response["TotalRecords"];
  });

  var settings = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/payment-gateways/?pageSize=" + pageSize,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };
  $.ajax(settings).done(function (response) {
    payInfo = response["Records"];
  });
  // console.log(payInfo);

  var settings2 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings2).done(function (response) {
    pageSize = response["TotalRecords"];
  });

  var settings4 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings4).done(function (response) {
    var users = response["Records"];
    $.each(users, function (index, user) {
      if (user["Roles"].indexOf("Merchant") > -1) {
        allMerchants.push(user["ID"]);
      }
    });
  });

  $.each(allMerchants, function (index, merchant) {
    paymentData[merchant] = [];
    var settings5 = {
      "url": "https://" + CORS + baseURL + "/api/v2/merchants/" + merchant + "/payment-acceptance-methods",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer " + token
      },
      "async": false
    };
    $.ajax(settings5).done(function (response) {
      var paymentMethods = response["Records"];
      $.each(paymentMethods, function (index, pay) {
        var code = pay["PaymentGateway"]["Code"];
        var payName = getPayName(payInfo, code);
        // console.log(payName);
        if (paymentData[merchant].indexOf(payName) == -1) {
          paymentData[merchant].push(payName);
        }
      });
    });
  });



  return paymentData
}

function getPayName(allPays, code) {
  // console.log(code);
  for (i = 0; i < allPays.length; i++) {
    if (allPays[i]["Code"] == code) {
      return allPays[i]["Gateway"];
    }
  }

  return "||Deleted Gateway||";
}

function calculateHistoricalData(userType) {

  var orderHistory;
  var numOfRecords;
  var commPercent;
  var records;
  var currDate = new Date();
  var MegaData = {};
  var count = 0;

  var MegaData = createMegaData(userType);
  // console.log(MegaData);

  var settings3 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/transactions/?pageSize=1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings3).done(function (response) {
    numOfRecords = response["TotalRecords"];
    // var payment = response["Records"][0]["Orders"][0]["PaymentDetails"][0];
    // commPercent = payment["Fee"]/(parseFloat(payment["Total"])+parseFloat(payment["Fee"]));

  });

  var settings = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/transactions/?pageSize=" + numOfRecords,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings).done(function (response) {
    records = response["Records"];
    $.each(records, function (index, record) {

      var orders = record["Orders"];
      $.each(orders, function (index, order) {

        var payDetails = order["PaymentDetails"];
        $.each(payDetails, function (index, payDetail) {
          if (payDetail["InvoiceNo"] == record["InvoiceNo"]) {
            var orderDate = new Date(payDetail["DateTimeCreated"] * 1000);
            var orderYear = orderDate.getUTCFullYear();
            var orderMonth = orderDate.getMonth();
            var trans = transactionName[userType];
            var kName = keyName[userType];

            if (orderYear != currDate.getUTCFullYear() || orderMonth != currDate.getMonth()) {
              var price = parseFloat(payDetail["Total"]);
              var fee = parseFloat(payDetail["Fee"]);
              if (MegaData[orderYear] == null) {
                MegaData[orderYear] = {};
              }
              if (MegaData[orderYear][orderMonth] == null) {
                MegaData[orderYear][orderMonth] = {};
              }
              if (MegaData[orderYear][orderMonth][payDetail[trans]["ID"]] == null) {
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]] = {
                  "Name": payDetail[trans]["FirstName"] + " " + payDetail[trans]["LastName"] + " (Deleted)", [kName]: Math.round(price * 100) / 100,
                  "Number of Orders": 1,
                  "Total Admin Commission": Math.round(fee * 100) / 100
                }
              }
              else {
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]][keyName[userType]] += price;
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]][keyName[userType]] = Math.round(MegaData[orderYear][orderMonth][payDetail[trans]["ID"]][keyName[userType]] * 100) / 100;
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Number of Orders"]++;
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Total Admin Commission"] += fee;
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Total Admin Commission"] = Math.round(MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Total Admin Commission"] * 100) / 100;
              }
            }
          }
        })
      })
    })
  });


  $.each(Object.keys(MegaData), function (index, year) {
    $.each(Object.keys(MegaData[year]), function (index, month) {
      MegaData[year][month] = sortData(MegaData[year][month], keyName[userType]);
    })
  })

  return MegaData;


}

function createMegaData(userType) {
  var MegaData = {};
  var recordSize;
  var allUsers;
  var minYear;
  var minMonth;
  var currDate = new Date();
  var kName = keyName[userType];
  var settings2 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings2).done(function (response) {
    recordSize = response["TotalRecords"];
  });

  var settings3 = {
    "url": "https://" + CORS + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + recordSize,
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "async": false
  };

  $.ajax(settings3).done(function (response) {
    allUsers = response["Records"];
  });

  $.each(allUsers, function (index, user) {
    if (user["Roles"].indexOf(userType) > -1) {
      var dateCreated = new Date(user["DateJoined"] * 1000);
      if (MegaData[dateCreated.getUTCFullYear()] == null) {
        MegaData[dateCreated.getUTCFullYear()] = {};
      }
      if (MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()] == null) {
        MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()] = {};
      }
      MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()][user["ID"]] = { "Name": user["FirstName"] + " " + user["LastName"], [kName]: 0, "Number of Orders": 0, "Total Admin Commission": 0 };
    }

  })


  minYear = Object.keys(MegaData)[0];
  minMonth = Object.keys(MegaData[minYear])[0];
  var prevData = {};

  for (var i = minYear; i <= currDate.getUTCFullYear(); i++) {
    if (i == minYear) {
      var startMonth = minMonth;
      var endMonth = 11;
    }
    else if (i == currDate.getUTCFullYear()) {
      var startMonth = 0;
      var endMonth = currDate.getMonth() - 1;
    }
    else {
      var startMonth = 0;
      var endMonth = 11;
    }

    for (var j = startMonth; j <= endMonth; j++) {
      if (MegaData[i] == null) {
        MegaData[i] = {};
      }
      if (MegaData[i][j] == null) {
        MegaData[i][j] = {};
      }
      MegaData[i][j] = jQuery.extend(true, prevData, MegaData[i][j]);
      prevData = jQuery.extend(true, {}, MegaData[i][j]);
    }
  }

  return MegaData;
}


function updateFrontEnd(data, tableID) {

  var table = document.getElementById(tableID);
  var tableClass = table.className;
  var tabelID = table.id;
  table.innerHTML = "";
  table.className = tableClass;
  table.id = tableID;

  var header = document.createElement("thead");
  var body = document.createElement("tbody");

  table.appendChild(header);
  table.appendChild(body);

  var headerRow = document.createElement("tr");

  // data = getTopMerchants();
  // console.log(data);
  keys = Object.keys(data);

  headers = data[keys[0]];

  for (header in headers) {
    var heading = document.createElement("th");
    heading.innerHTML = header;
    heading.style = "text-align:center";

    headerRow.appendChild(heading);
  }

  table.childNodes[0].appendChild(headerRow);

  for (merchant in data) {
    var newRow = document.createElement("tr");

    for (header in headers) {
      var rowData = document.createElement("td");
      rowData.innerHTML = data[merchant][header];
      rowData.style = "text-align:center";
      newRow.appendChild(rowData);
    }

    table.childNodes[1].appendChild(newRow);
  }
}

// var testData = {"58bc1c9b-ec12-45fc-a327-01ac1315227d":{"Total Revenue":107.5,"Name":"Rachael Chin","Number of Orders":2,"Total Admin Commission":16.125},"2a593ae6-f045-4aab-a18a-18980757a637":{"Total Revenue":149.89999999999998,"Name":"Hombre Cantina","Number of Orders":2,"Total Admin Commission":22.484999999999996},"b716f332-8e10-4b03-b4e3-59459f47f8ab":{"Total Revenue":96.5,"Name":"Simone Wong","Number of Orders":3,"Total Admin Commission":14.475},"a67e93ec-6db7-46a2-ac2c-8a270c3e5c67":{"Total Revenue":106,"Name":"Allen Chng","Number of Orders":5,"Total Admin Commission":15.899999999999999},"ef7f053b-0895-4467-a912-afd782733600":{"Total Revenue":159.6,"Name":"Carrie Er","Number of Orders":4,"Total Admin Commission":23.939999999999998},"240a08f1-6743-4fc7-aac1-b2f32c92a64f":{"Total Revenue":0,"Name":"Joseph  string","Number of Orders":0,"Total Admin Commission":0},"9241526d-f5e2-450e-a945-c0a51fc1b533":{"Total Revenue":0,"Name":"Ubud Ayu","Number of Orders":0,"Total Admin Commission":0},"d5b7b62c-d43f-42c1-afa7-cc23b2dbdc60":{"Total Revenue":0,"Name":"Arcadier Marketing","Number of Orders":0,"Total Admin Commission":0},"f0eb83ce-3fcd-4c4f-9378-fe663f8ba0f4":{"Total Revenue":150,"Name":"Huiyan Rachael (Deleted)","Number of Orders":5,"Total Admin Commission":22.5}};
//
// // console.log(JSON.stringify(sortData(testData)));
// updateFrontEnd(sortData(testData,"Total Revenue"));

function sortData(data, sortingKey) {
  arrayData = Object.keys(data).map(function (key) {
    return [key, data[key][sortingKey]];
  });
  // console.log(arrayData);
  sortedArray = mergesort(arrayData);
  // console.log(sortedArray);
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
