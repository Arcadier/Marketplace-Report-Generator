function getCookie(name){
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
      return parts.pop().split(';').shift();
  }
}

// var token = "Q93Jbu5N-jYjIcqV4pUUa5R0WAdhZoW24KopOQvGHPVH8Op3KGtUbYKT2tZDjm3Xg1ulYYsG_BiGghoE3bZijRBmyqflO2nZ_Zyrv-vUQzhLkLnhVmRLUiLd3dg7WbvqhXhRqGzuKP_5fitRlqVV7XxYo0bpcDguCqxBnuLvzWZI9VkiJ40ykVVnCl3CcNkMpJKBquRmKwOuMb1PJDNGwppvd4O-jZ7q2n11N2EzS8sjn6mU8gMleBBA4spSIe72x_0XEh4yjk30VDP3RQcy1zbrfKR4SGJXW-VQjXY-hHgI9w1WgvqymTmtUsp52yD5Cjgata5qnokPZYzG4hNjbLoutDheDBc1HyBtJbmkbyURlF8efSjqlJPuyEV9YHRneafot7UsM3hLaZ-kkLoFx6g7BBE-4E7u6-eJL37DX74avdGAsFpVwAZPEP1v7aehZVRbaB5GvoCsqEIMOt72cM_47rxf4tL74R1zV-_NAyZjXbOlZmtlf8imQFUwip8ogMClkd0Oayswfz3WndgN4d2r8JjiSs69_kejJ2hvEvFmC9JFJeE2xQUFZEOhJ3liK24XCTjYnX8Ha4629S0S121FQ7oTZFhCOco0qaoUj8EhTahua9SgVF25THX_x4AGPJ9fniBGVPMyhsMHjx_Il0WkU_C3q4MEnETUdNATcRrZcANYrZg3GCn0N56M9LOrEkC7AToBoZ1pVbOa1gDJZLNrkjLXhft14VdTP6yvMFb-RIbU6kwSHGX-CStKG3yYNii96JAtD5zhAX466ZR1xtt7kiBoPdc4D8VywuNeGDj_CYg-";
// var baseURL = "royally.test.arcadier.io";


var baseURL = window.location.hostname;
var token = getCookie('webapitoken');
var adminID;

function getTopMerchants() {

  var data = {};
  var topNum = document.getElementById("TopNum").value;
  var topDogs = {};
  adminID = document.getElementById("userGuid").value;
  var settings =  {
    "url": "https://"+baseURL+"/api/v2/admins/"+adminID+"/transactions",
    "method":"GET",
    "headers":{
      "Authorization":"Bearer "+token
    },
    "async":false
  };

  // var settings =  {
  //   "url": "https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/admins/"+adminID+"/transactions",
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
        // var price = order["GrandTotal"];

        if (topDogs[merchantID]==null){
          topDogs[merchantID] = price;
        }

        else{
          topDogs[merchantID]+= price;
        }
      })
    })
  });
  // console.log(topDogs);

  for (var i = 0;i<topNum;i++){
    // console.log("Entered "+i);
    var max = -1;
    var maxid = null;
    $.each(Object.keys(topDogs),function(index,id){
      if (topDogs[id]>max){
        max = topDogs[id];
        maxid = id;
      }
    })

    data[maxid] = {"Rank":i+1,"Name":getName(maxid),"Revenue":max};
    topDogs[maxid] = null;
  }

  return data;

}

function updateFrontEnd(){

  var table = document.getElementById("InfoTable");
  table.innerHTML = "";
  table.border = 2;

  var headerRow = document.createElement("tr");

  data = getTopMerchants();
  addPhone(data);
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

function getName(id){

  var Name;
  var settings = {
    "url":"https://"+baseURL+"/api/v2/users/"+id,
    "method":"GET",
    "async":false
  };

  // var settings = {
  //   "url":"https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/users/"+id,
  //   "method":"GET",
  //   "async":false
  // };

  $.ajax(settings).done(function(response){
    if (response["DisplayName"]==""){
      Name = response["Email"];
    }
    else{
      Name = response["DisplayName"];
    }
  })

  return Name;
}

function addPhone(data){


  for (merchant in data){
    // var settings = {
    //   "url":"https://cors-anywhere.herokuapp.com/"+baseURL+"/api/v2/users/"+merchant,
    //   "method":"GET",
    //   "async":false
    // };

    var settings = {
      "url":"https://"+baseURL+"/api/v2/users/"+merchant,
      "method":"GET",
      "async":false
    };

    $.ajax(settings).done(function(response){
      data[merchant]["Phone Number"] = response["PhoneNumber"];
    })
  }


}
