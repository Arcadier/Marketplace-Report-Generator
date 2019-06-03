function getCookie(name){
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
      return parts.pop().split(';').shift();
  }
}

// var token = "yHIiTEZ-rF0491YsqGHbWFbj27Hg8y6AzXL-2kDo9ETwlZC6gFF3IzvNQBXwXwcLlwQSKLCCFKHENLDNvmVcg_YCkKp68fIavYRoa2wlg-C6IUbzaFmhfRcqtge87Ch8l-wTKpEMZX6sZdlYO6QvqBy8cqVrxFLhn8xRISouUGCitctOqyPYN9yGo1OjjDdfM52Dvf7TXYLGJZ8Oj-K9RL-UMhXb4eTE6pANcZx8BMaFaSIK-nkQplUAbNUwUxyADCbSwkhOJliOX1WCgKRu6z2_FjnLAigm4FErWG3aNexfzei2QvC4OiJtUP2-Xm6UTFTnR3vbcq3Rfx8riwQ_WbXEPmRiftDb_ddtB_4gIJMFtfdwZg_9sjUjDiDdeBZq7OagzO0Pyqglr-i3YsYUvvpU26uO5qZYq4qararcMSp2MM6qXDcnfJu8xYCziNyFXZZytJYUwE5q9eVVXKd-iqY5CsaoJ_kPwx36uUgMUjrjs059_Me-iRM2WKnEBnM4wunhffSlg8Xm6SqJB1DryS-8ffbfkVn-UxPowYXLB8oWjgiTWxKfxatFOGI6q4BPn8szsBcPb_kG7nxyUf6sQ3imdaJrxIbYkbtb5jti796kragzovJJLNsXBxdosV1AUqUzmfBmjnyjJny8uS5JQ3mNgS0mSodbmWihy8ClweIkFK4n4umYsUg3N65-uOnQgqZ1GnsjGdRPnb3daDjppEvccKAbFKJSZteZCKKcrCVWsYNLN1U-BDkh8qdXsiWurU6HV4vCy-IGxpN2hbuksYbe4RhUMCgBco_KoMPI0kU2pq3FAO5rWfBuvisL2qYWULLrGE6bgwH2peuN1_y-J5HmRwpQvPYvM7wnXReb-cK9Tj6W";
// var baseURL = "forgottentoy.test.arcadier.io";


var baseURL = window.location.hostname;
var token = getCookie('webapitoken');
var adminID;

function getTopMerchants() {

  var data = {};
  var topNum = document.getElementById("TopNum").value;
  var topDawgs = {};
  var topDawgsNames = {};
  var commission = {};
  var numOfRecords;
  adminID = document.getElementById("userGuid").value;

  var settings2 = {
    "url": "https://"+baseURL+"/api/v2/admins/"+adminID+"/users",
    "nethod": "GET",
    "headers": {
      "Authorization": "Bearer "+token
    },
    "async": false
  };

  // var settings2 = {
  //   "url": "https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/admins/"+adminID+"/users",
  //   "nethod": "GET",
  //   "headers": {
  //     "Authorization": "Bearer "+token
  //   },
  //   "async": false
  // };

  $.ajax(settings2).done(function(response){
    var users = response.Records;
    $.each(users, function(index, user){
      if (user["Roles"].indexOf("Merchant")>-1){
        topDawgs[user.ID] = 0;
        topDawgsNames[user.ID] = user["FirstName"]+" "+user["LastName"];
      }
    })
  });

  var settings3 =  {
    "url": "https://"+baseURL+"/api/v2/admins/"+adminID+"/transactions",
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  // var settings3 =  {
  //   "url": "https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/admins/"+adminID+"/transactions",
  //   "method":"GET",
  //   "headers":{
  //     "Authorization":"Bearer "+token
  //   },
  //   "async":false
  // };

  $.ajax(settings3).done(function(response){
    numOfRecords = response["TotalRecords"];
  });

  var settings =  {
    "url": "https://"+baseURL+"/api/v2/admins/"+adminID+"/transactions/?pageSize="+numOfRecords,
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  // var settings =  {
  //   "url": "https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/admins/"+adminID+"/transactions/?pageSize="+numOfRecords,
  //   "method":"GET",
  //   "headers":{
  //     "Authorization":"Bearer "+token
  //   },
  //   "async":false
  // };
  $.ajax(settings).done(function(response){
    var records = response["Records"];
    $.each(records, function(index,record){

      var orders = record["Orders"];
      $.each(orders, function(index,order){

        var merchantID = order["PaymentDetails"][0]["Payee"]["ID"];
        var price = parseFloat(order["PaymentDetails"][0]["Total"]) + parseFloat(order["PaymentDetails"][0]["Fee"]);
        var comm = parseFloat(order["PaymentDetails"][0]["Fee"])
        // var price = order["GrandTotal"];
        if (topDawgs[merchantID]==null){
          topDawgs[merchantID]=price;
        }
        else{
          topDawgs[merchantID]+=price;
        }

        if (topDawgsNames[merchantID]==null){
          topDawgsNames[merchantID] = order["PaymentDetails"][0]["Payee"]["FirstName"]+" "+order["PaymentDetails"][0]["Payee"]["LastName"];
        }

        // console.log(topDawgs);
      })
    })
  });



  var NumOfMerchants = Object.keys(topDawgsNames).length;
  var loops = topNum>NumOfMerchants? NumOfMerchants:topNum;
  for (var i = 0;i<loops;i++){
    // console.log("Entered "+i);
    var max = -1;
    var maxid = null;
    $.each(Object.keys(topDawgs),function(index,id){
      if (topDawgs[id]>max){
        max = topDawgs[id];
        maxid = id;
      }
    })

    if(topDawgs[maxid]>-1){
      data[maxid] = {"Rank":i+1,"Name":topDawgsNames[maxid],"Revenue":max};
      topDawgs[maxid] = -2;
    }


  }

  return data;

}

function updateFrontEnd(){

  var table = document.getElementById("InfoTable");
  table.innerHTML = "";
  table.border = 2;

  var headerRow = document.createElement("tr");

  data = getTopMerchants();
  keys = Object.keys(data);

  headers = data[keys[0]];

  for (header in headers){
    var heading = document.createElement("th");
    heading.innerHTML = header;

    headerRow.appendChild(heading);
  }

  table.appendChild(headerRow);

  for (merchant in data){
    var newRow = document.createElement("tr");

    for (header in headers){
      var rowData = document.createElement("td");
      rowData.innerHTML = data[merchant][header];
      newRow.appendChild(rowData);
    }

    table.appendChild(newRow);
  }
}
