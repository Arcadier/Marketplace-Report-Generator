function getCookie(name){
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
      return parts.pop().split(';').shift();
  }
}

// var token = "2fZUsWtPyybJ4TpWP_7WEfGFxKLnowTWquiFPa6Yt8JIGsFFhlrluM5jTYwxlMWMfeDbsyih5HmMeCZzBO6rDUgcNrQwepqUvlQZ4iYOQI5p1kqpicFcG-izcUauV0unx_2TAJV_a-HeoQiy2Ze6xG7--tvICHBadKkjXgr_m6zIvBZsEgOmakEdIjMAqX7cGHAT967sTMIQW_D_YUQEH1Mz6wDSla9naBQJMiF6BmluUkzguME_8eGjuriVWwmjzQs1WpFZQ2OWbdmLnvmsDvZAy0RkJteU4CL5oT0QYYG5z1fWJca3KNnwcIz_zOt70YEp_Q9ss-VF4GoBd6i8MoNbzkdg8LwKxZJMj7ytjT6ub6tjtoKq-z7fGcEGtOh2RroypGSgBKLW4eXjt9E4zcVv8YAquUlYIFmL97gW3FS-1TylLJ53Do6WR6ZzWKBkbQlK-0YZ0YBOLJ-W38xDX0XuSkEGVZhFHPUDVBAAHO8NKitUNvwhy6UxNG8uT_eN8eFEMWRr52OvG4DWe5uY785-piQP3TPl95N2TKN70MrOxuyfwOtsehoeGE2qZ9s0O9eJMvGavEjbeS0QoCMeledOHEKi7ytqxo-sGJlxaFX6pbu5X7PBS4fUoHua29Ky1DeYA96k6kZAVg1RPS8KcujeE6D-ASKe39cgF5MV8nenzJUgKGoDtmJRofeZ9ZTnh-GkbYuiKSy3vQsJ3FPcto1khaKCOMxuKk2Iwq9m2ehuQjt4bSbyDapPkn0gFiuM_9stA0DOW0-zBYDdTzDTnSwXWYC1-peRhbooWwZVuA_ZXJ5DdWuOX2MAUEhHDYmP-pJbe3_cBci4udvHV70JWwP5C4xDocxJJtcHzsRkJ7U1iuhK";
// var baseURL = "forgottentoy.test.arcadier.io";

var baseURL = window.location.hostname;
var token = getCookie('webapitoken');

var adminID;
// var CORS = "cors-anywhere.herokuapp.com/";
var CORS = "";
var keyName = {"Merchant":"Total Revenue","User":"Total Money Spent"};
var transactionName = {"Merchant":"Payee","User":"Payer"};
var MerchantHistory;
var UserHistory;
var selectedDate;
var MerchantMonthData;
var BuyerMonthData;
var MerchantdateSelected = false;
var BuyerdateSelected = false;

$(document).ready(function(){
  MerchantHistory = setHistoricalData("Merchant");
  BuyerHistory = setHistoricalData("User");
  

  $("#dateStartPickerMerchant").on('changeDate',function(selected){
    MerchantdateSelected = true;
    selectedDate = new Date(selected.date.valueOf()+1300000000);
    MerchantMonthData = MerchantHistory[selectedDate.getUTCFullYear()][selectedDate.getMonth()];
    var rank = parseInt(document.getElementById("MerchantChosenRanking").innerHTML.split(' ')[1]);
    var rankedData = rankings(MerchantMonthData,rank);
    updateFrontEnd(rankedData,"MerchantTable");
    // console.log("Merchant Date Picked", rankedData);
  });

  $("#dateStartPickerBuyer").on('changeDate',function(selected){
    BuyerdateSelected = true
    selectedDate = new Date(selected.date.valueOf()+1300000000);
    BuyerMonthData = BuyerHistory[selectedDate.getUTCFullYear()][selectedDate.getMonth()];
    var rank = parseInt(document.getElementById("BuyerChosenRanking").innerHTML.split(' ')[1]);
    var rankedData = rankings(BuyerMonthData,rank);
    updateFrontEnd(rankedData,"BuyerTable");
    // console.log("Buyer Date Picked", rankedData);

  });

  $("#MerchantRankings li a").click(function(){
    rank = parseInt($(this).text().split(' ')[1]);
    if (MerchantdateSelected)
    {
      var rankedData = rankings(MerchantMonthData,rank);
      updateFrontEnd(rankedData,"MerchantTable");
    }
    // console.log("Merchant changed rank",rankedData);
  })

  $("#BuyerRankings li a").click(function(){
    rank = parseInt($(this).text().split(' ')[1]);
    if (BuyerdateSelected)
    {
      var rankedData = rankings(BuyerMonthData,rank);
      updateFrontEnd(rankedData,"BuyerTable");
    }
    // console.log("Buyer changed rank",rankedData);
  })
});




function rankings(data,rank){
  var returnData={};

  var keys = Object.keys(data);
  var countTill = keys.length<rank?keys.length:rank;

  for (var i = 0; i<rank; i++){
    returnData[keys[i]] = Object.assign({},data[keys[i]]);
  }
  // console.log(returnData);
  return returnData;
}

function setHistoricalData(userType)
{
  var HistoricalData;
  adminID = document.getElementById("userGuid").value;
  var reqData;
  var cfName = userType.toLowerCase()+"defaulthistory";
  var settings = {
    "url": "https://"+CORS+baseURL+"/api/v2/marketplaces",
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  $.ajax(settings).done(function(response){
    var cfs = response["CustomFields"];
    $.each(cfs,function(index,cf){
      if (cf["Name"]==cfName)
      {
        reqData = JSON.parse(cf["Values"][0]);
      }
    })
  });

  if (reqData)
  {
    HistoricalData = reqData;
  }

  else
  {
    HistoricalData = calculateHistoricalData(userType);
    var cfData =
    {
      "Name": cfName,
      "DataInputType": "textfield",
      "ReferenceTable": "Implementations",
      "DataFieldType": "string",
      "IsMandatory":true,
      "IsSearchable": true
    };

    var settingstest ={
        "url": "https://"+ CORS + baseURL + "/api/v2/admins/" + adminID + "/custom-field-definitions",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        "data": JSON.stringify(cfData)
    };

    $.ajax(settingstest).done(function(response){

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
        "url": "https://"+ CORS + baseURL + "/api/v2/marketplaces",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        "data": JSON.stringify(historyCf)
      };

      $.ajax(settings3).done(function(){
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

function calculateHistoricalData(userType){

  var orderHistory;
  var numOfRecords;
  var commPercent;
  var records;
  var currDate = new Date();
  var MegaData = {};
  var count = 0;
  adminID = document.getElementById("userGuid").value;

  var MegaData = createMegaData(userType);
  // console.log(MegaData);

  var settings3 =  {
    "url": "https://"+CORS+baseURL+"/api/v2/admins/"+adminID+"/transactions/?pageSize=1",
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  $.ajax(settings3).done(function(response){
    numOfRecords = response["TotalRecords"];
    var payment = response["Records"][0]["Orders"][0]["PaymentDetails"][0];
    commPercent = payment["Fee"]/(parseFloat(payment["Total"])+parseFloat(payment["Fee"]));

  });

  var settings =  {
    "url": "https://"+CORS+baseURL+"/api/v2/admins/"+adminID+"/transactions/?pageSize="+numOfRecords,
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  $.ajax(settings).done(function(response){
    records = response["Records"];
    $.each(records, function(index,record){

      var orders = record["Orders"];
      $.each(orders, function(index,order){

        var payDetails = order["PaymentDetails"];
        $.each(payDetails, function(index, payDetail){
          if (payDetail["InvoiceNo"]==record["InvoiceNo"]){
            var orderDate = new Date(payDetail["DateTimeCreated"]*1000);
            var orderYear = orderDate.getUTCFullYear();
            var orderMonth = orderDate.getMonth();
            var trans = transactionName[userType];
            var kName = keyName[userType];

            if (orderYear!=currDate.getUTCFullYear() || orderMonth!=currDate.getMonth())
            {
              var price = parseFloat(payDetail["Total"])+parseFloat(payDetail["Fee"]);
              if (MegaData[orderYear]==null)
              {
                MegaData[orderYear] = {};
              }
              if (MegaData[orderYear][orderMonth] == null)
              {
                MegaData[orderYear][orderMonth] = {};
              }
              if (MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]==null)
              {
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]] = {"Name": payDetail[trans]["FirstName"]+" "+payDetail[trans]["LastName"]+" (Deleted)",[kName]: price,
                   "Number of Orders": 1,
                   "Total Admin Commission":price*commPercent};
              }
              else
              {
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]][keyName[userType]]+=price;
                var currPrice = MegaData[orderYear][orderMonth][payDetail[trans]["ID"]][keyName[userType]];
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Number of Orders"]++;
                MegaData[orderYear][orderMonth][payDetail[trans]["ID"]]["Total Admin Commission"] = Math.round(commPercent*currPrice*100)/100;
              }
            }
          }
        })
      })
    })
  });


  $.each(Object.keys(MegaData),function(index,year){
    $.each(Object.keys(MegaData[year]),function(index,month){
      MegaData[year][month] = sortData(MegaData[year][month],keyName[userType]);
    })
  })

  return MegaData;


}

function createMegaData(userType)
{
  var MegaData = {};
  var recordSize;
  var allUsers;
  var minYear;
  var minMonth;
  var currDate = new Date();
  var kName = keyName[userType];
  var settings2 = {
    "url": "https://"+CORS+baseURL+"/api/v2/admins/"+adminID+"/users/?pageSize=1",
    "nethod": "GET",
    "headers": {
      "Authorization": "Bearer "+token
    },
    "async": false
  };

  $.ajax(settings2).done(function(response){
    recordSize = response["TotalRecords"];
  });

  var settings3 = {
    "url": "https://"+CORS+baseURL+"/api/v2/admins/"+adminID+"/users/?pageSize="+recordSize,
    "nethod": "GET",
    "headers": {
      "Authorization": "Bearer "+token
    },
    "async": false
  };

  $.ajax(settings3).done(function(response){
    allUsers = response["Records"];
  });

  $.each(allUsers,function(index,user){
    if (user["Roles"].indexOf(userType)>-1)
    {
      var dateCreated = new Date(user["DateJoined"]*1000);
      if (MegaData[dateCreated.getUTCFullYear()]==null)
      {
        MegaData[dateCreated.getUTCFullYear()] = {};
      }
      if (MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()]==null)
      {
        MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()] = {};
      }
      MegaData[dateCreated.getUTCFullYear()][dateCreated.getMonth()][user["ID"]] = {"Name": user["FirstName"]+" "+user["LastName"], [kName]: 0, "Number of Orders": 0,"Total Admin Commission":0};
    }

  })


  minYear = Object.keys(MegaData)[0];
  minMonth = Object.keys(MegaData[minYear])[0];
  var prevData = {};

  for (var i = minYear; i<=currDate.getUTCFullYear(); i++)
  {
    if (i==minYear)
    {
      var startMonth = minMonth;
      var endMonth = 11;
    }
    else if (i==currDate.getUTCFullYear())
    {
      var startMonth = 0;
      var endMonth = currDate.getMonth()-1;
    }
    else
    {
      var startMonth = 0;
      var endMonth = 11;
    }

    for (var j = startMonth; j<=endMonth; j++)
    {
      if (MegaData[i]==null){
        MegaData[i] = {};
      }
      if (MegaData[i][j]==null){
        MegaData[i][j] = {};
      }
      MegaData[i][j] = jQuery.extend(true,prevData,MegaData[i][j]);
      prevData = jQuery.extend(true,{},MegaData[i][j]);
    }
  }

  return MegaData;
}


function updateFrontEnd(data,tableID){

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

  for (header in headers){
    var heading = document.createElement("th");
    heading.innerHTML = header;

    headerRow.appendChild(heading);
  }

  table.childNodes[0].appendChild(headerRow);

  for (merchant in data){
    var newRow = document.createElement("tr");

    for (header in headers){
      var rowData = document.createElement("td");
      rowData.innerHTML = data[merchant][header];
      newRow.appendChild(rowData);
    }

    table.childNodes[1].appendChild(newRow);
  }
}

// var testData = {"58bc1c9b-ec12-45fc-a327-01ac1315227d":{"Total Revenue":107.5,"Name":"Rachael Chin","Number of Orders":2,"Total Admin Commission":16.125},"2a593ae6-f045-4aab-a18a-18980757a637":{"Total Revenue":149.89999999999998,"Name":"Hombre Cantina","Number of Orders":2,"Total Admin Commission":22.484999999999996},"b716f332-8e10-4b03-b4e3-59459f47f8ab":{"Total Revenue":96.5,"Name":"Simone Wong","Number of Orders":3,"Total Admin Commission":14.475},"a67e93ec-6db7-46a2-ac2c-8a270c3e5c67":{"Total Revenue":106,"Name":"Allen Chng","Number of Orders":5,"Total Admin Commission":15.899999999999999},"ef7f053b-0895-4467-a912-afd782733600":{"Total Revenue":159.6,"Name":"Carrie Er","Number of Orders":4,"Total Admin Commission":23.939999999999998},"240a08f1-6743-4fc7-aac1-b2f32c92a64f":{"Total Revenue":0,"Name":"Joseph  string","Number of Orders":0,"Total Admin Commission":0},"9241526d-f5e2-450e-a945-c0a51fc1b533":{"Total Revenue":0,"Name":"Ubud Ayu","Number of Orders":0,"Total Admin Commission":0},"d5b7b62c-d43f-42c1-afa7-cc23b2dbdc60":{"Total Revenue":0,"Name":"Arcadier Marketing","Number of Orders":0,"Total Admin Commission":0},"f0eb83ce-3fcd-4c4f-9378-fe663f8ba0f4":{"Total Revenue":150,"Name":"Huiyan Rachael (Deleted)","Number of Orders":5,"Total Admin Commission":22.5}};
//
// // console.log(JSON.stringify(sortData(testData)));
// updateFrontEnd(sortData(testData,"Total Revenue"));

function sortData(data,sortingKey){
  arrayData = Object.keys(data).map(function(key){
    return [key,data[key][sortingKey]];
  });
  // console.log(arrayData);
  sortedArray = mergesort(arrayData);
  // console.log(sortedArray);
  sortedData = {}

  for (var i=0;i<sortedArray.length;i++){
    var ID = sortedArray[i][0];
    newData = Object.assign({"Rank":i+1},data[ID]);
    sortedData[ID] = newData;
  }

  return sortedData;

}

function getValue(array){
  return array[1];
}

function mergesort(array){
  if (array.length<2){
    return array
  }
  else {
    var mid = parseInt(array.length/2);
    var left = array.splice(0,mid);
    var right = array;
    left = mergesort(left);
    right = mergesort(right);
    return merge(left,right);
  }
}

function merge(array1,array2){
  var returnArr = [];

  while (array1.length!=0 && array2.length!=0){
    if (getValue(array1[0])==getValue(array2[0])){
      returnArr.push(array1.shift());
      returnArr.push(array2.shift());
    }
    else if (getValue(array1[0])>getValue(array2[0])){
      returnArr.push(array1.shift());
    }
    else{
      returnArr.push(array2.shift());
    }
  }

  returnArr = returnArr.concat(array1);
  returnArr = returnArr.concat(array2);

  return returnArr;
}
