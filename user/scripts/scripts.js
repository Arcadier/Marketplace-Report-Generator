var baseURL = window.location.hostname;
var cf = false;
var cfCode = false;
var code;

var scriptSrc = document.currentScript.src;
var index = scriptSrc.search(/\/scripts\//);
var packagePath = scriptSrc.slice(0,index).trim();

function updateCF()
{
  var userkey = makeRandomKey();
  makeCookie("userkey",userkey);
  console.log(userkey);
  var today = new Date();
  var currDate = today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getUTCFullYear();
  if (cf)
  {
    var latest = cf["latestData"]["date"].split("-");

    if (today.getUTCFullYear()!=latest[2] || today.getMonth()!=latest[1]-1 || today.getDate()!=latest[0])
    {
      delete cf["latestData"]["date"];
      var data = cf["latestData"];
      if (cf["historicalData"][latest[2]]==null)
      {
        cf["historicalData"][latest[2]] = {};
      }
      if (cf["historicalData"][latest[2]][latest[1]-1]==null)
      {
        cf["historicalData"][latest[2]][latest[1]-1] = {};
      }
      cf["historicalData"][latest[2]][latest[1]-1][latest[0]] = $.extend(true,{},data);

      cf["latestData"] = {};
      cf["latestData"]["date"] = currDate;
    }


    cf["latestData"][userkey] = 0;
    cf = JSON.stringify(cf);
    makeCustomField("logincount","Implementations", true, code, null, cf);
    cf = JSON.parse(cf);
  }
  else
  {
    var loginc = {"latestData":{[userkey]:1,"date":currDate},"historicalData":{}};
    loginc = JSON.stringify(loginc);
    makeCustomField("logincount","Implementations", false, null, null, loginc);
  }
}

function userlogins(packagePath)
{
  // var adminID = document.getElementById("userGuid").value;
  // console.log(packagePath);
  var login = /page-login[\s\S]*?/;
  var homePage = /page-home[\s\S]*?/;
  console.log(!!document.body.className.match(login));
  console.log(!!document.body.className.match(homePage));



  var url = "https://"+baseURL+"/api/v2/marketplaces";
  var call = {
    "url":url,
    "method":"GET",
    "async":false
  };
  $.ajax(call).done(function(res){
    var cfs = res["CustomFields"];
    for (var i = 0; i<cfs.length; i++)
    {
      var cfCode = cfs[i]["Code"];
      if (cfCode.startsWith("logincount"))
      {
        cf = JSON.parse(cfs[i]["Values"]);
        code = cfCode;
        break;
      }
    }
  });

  if (!!document.body.className.match(login))
  {
    var submitButton = document.getElementById("login-submit");
    var googleButton = document.getElementsByClassName("login-btn btn-google")[0];
    var facebookButton1 = document.getElementsByClassName("login-btn btn-facebook")[0];
    var facebookButton2 = document.getElementsByClassName("login-btn btn-facebook")[1];

    // console.log($(".login-btn btn-google"));
    // $(".login-btn btn-google").on("click",updateCF);
    // $(".login-btn btn-facebook").on("click",updateCF);
    // console.log(cf);
    // console.log("Google", googleButton);
    // console.log("Facebook 1", facebookButton1);
    // console.log("Facebook 2", facebookButton2);
    // console.log(cf["latestData"]);
    submitButton.onclick = updateCF;
    googleButton.addEventListener("click",updateCF,false);
    facebookButton1.addEventListener("click",updateCF,false);
    facebookButton2.addEventListener("click",updateCF,false);
    // var username = document.getElementsByName("username")[0].  value
  }
  else if (!!document.body.className.match(homePage))
  {
    var key = getCookie("userkey");
    var userGuid = document.getElementById("userGuid");
    if (userGuid!=null)
    {
      userGuid = userGuid.value;
      if (cf!=false && key!=null)
      {
        var data = cf["latestData"][key];
        if (cf["latestData"][userGuid]==null)
        {
          cf["latestData"][userGuid] = 1;
        }
        else
        {
          cf["latestData"][userGuid] += 1;
        }

        delete cf["latestData"][key];
        console.log(cf);
        cf = JSON.stringify(cf);
        makeCustomField("logincount","Implementations", true, code, null, cf);
      }
    }

    deleteCookie("userkey");
  }
}

function makeCookie(name,value)
{
  document.cookie = name+"="+value+"; "+"path=/";
}

function deleteCookie(name)
{
  document.cookie = name+"=; expires=Thu Jan 01 1970 07:30:00 GMT+0730; path=/";
}
function getCookie(name)
{
  var cookies = document.cookie;
  cookies = cookies.split(";");
  for (var i = 0; i<cookies.length; i++)
  {
    var cookie = cookies[i].split("=");
    if (cookie[0].trim() == name)
    {
      return cookie[1];
    }
  }
}

function logout()
{
  let r = $('input[name="__RequestVerificationToken"]').val();
  $.ajax({
      async: !1,
      cache: !1,
      type: "POST",
      data: {
          __RequestVerificationToken: r
      },
      url: "/account/logoff"
  });
  document.location.reload(true);
}

function makeRandomKey()
{
  var randomKey = "";
  for (var i = 0; i<100; i++)
  {
    randomKey+=Math.round(Math.random()*10);
  }
  return randomKey;
}

function makeCustomField(name,table,exists,code,id,value){

  var FinalResult;
  var url = packagePath + '/makecustomfields.php';
  // console.log(url);


  //Preparing the data to send to PHP file

  var data = {
    "Name":name,
    "Table":table,
    "Exists":exists,
    "Code":code,
    "Value":value,
    "ID":id
  }

  /*Using ajax to send the data to PHP file.
  Synchronous ajax (async:false) is used here because the function needs
  to assign result to FinalResults before it returns FinalResult.*/

  $.ajax({
      url: url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      async:false,
      success: function(result) {
          // toastr.success('Task successfully completed', 'Great');
          /*PHP returns a json encoded string.
          Parse the string into a JSON object and assign it to Final Result.*/
          FinalResult = JSON.parse(result);
      },
      error: function(error){
        toastr.error('Something went wrong','Error');
      }
  });

  return FinalResult;
}

$(document).ready(function(){
  userlogins(packagePath);
});


// $(document).ready(function(){


// });
