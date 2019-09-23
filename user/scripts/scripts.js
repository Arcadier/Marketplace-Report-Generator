/**
 * @fileoverview user side code to track the number of logins
 * @deprecated
 * 
 * @author Naseer Ahmed Khand
 */

/**
 * base url of the window
 * @constant
 * @type {String} 
 * @global
 */
var baseURL = window.location.hostname;

/**
 * custom field json value stored here
 * @type {JSON} 
 * @constant
 * @global
 */
var cf = false;

/**
 * value of the code of the custom field
 * @constant
 * @type {String}
 * @global
 */
var cfCode = false;

/**
 * 
 */
var code;

/**
 * url referring to the scripts tag
 * @global
 * @constant
 * @type {String}
 */
var scriptSrc = document.currentScript.src;

/**
 * index of the location of the regex
 * @type {Number}
 * @global
 * @constant
 */
var index = scriptSrc.search(/\/scripts\//);

/**
 * path referring to the package
 * @type {String}
 * @constant
 * @global
 */
var packagePath = scriptSrc.slice(0, index).trim();

/**
 * function to update the value of the custom field
 */
function updateCF() {
  // making a random key for the user
  var userkey = makeRandomKey();
  // making a cookie with the key
  makeCookie("userkey", userkey);
  var today = new Date();
  var currDate = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getUTCFullYear();
  // check if custom fields exist 
  if (cf) {
    // getting latest data doing manipulations and storing in the values of the login data
    var latest = cf["latestData"]["date"].split("-");
    if (today.getUTCFullYear() != latest[2] || today.getMonth() != latest[1] - 1 || today.getDate() != latest[0]) {
      delete cf["latestData"]["date"];
      var data = cf["latestData"];
      if (cf["historicalData"][latest[2]] == null) {
        cf["historicalData"][latest[2]] = {};
      }
      if (cf["historicalData"][latest[2]][latest[1] - 1] == null) {
        cf["historicalData"][latest[2]][latest[1] - 1] = {};
      }
      cf["historicalData"][latest[2]][latest[1] - 1][latest[0]] = $.extend(true, {}, data);

      cf["latestData"] = {};
      cf["latestData"]["date"] = currDate;
    }

    // storing in the custom field the value
    cf["latestData"][userkey] = 0;
    cf = JSON.stringify(cf);
    makeCustomField("logincount", "Implementations", true, code, null, cf);
    cf = JSON.parse(cf);
  }
  else {
    // storing in login data inside the custom field if the custom field doesn't exist
    var loginc = { "latestData": { [userkey]: 1, "date": currDate }, "historicalData": {} };
    loginc = JSON.stringify(loginc);
    makeCustomField("logincount", "Implementations", false, null, null, loginc);
  }
}

/**
 * function to track the loging of a user inside the login page by making random cookies and tracking it
 */
function userlogins() {
  var login = /page-login[\s\S]*?/;
  var homePage = /page-home[\s\S]*?/;
  var url = "https://" + baseURL + "/api/v2/marketplaces";
  var call = {
    "url": url,
    "method": "GET",
    "async": false
  };
  // calling api to get marketplace implementations
  $.ajax(call).done(function (res) {
    var cfs = res["CustomFields"];
    for (var i = 0; i < cfs.length; i++) {
      var cfCode = cfs[i]["Code"];
       if (cfCode.startsWith("logincount")) {
        cf = JSON.parse(cfs[i]["Values"]);
        code = cfCode;
        break;
      }
    }
  });

  // check if the page is the required page
  if (!!document.body.className.match(login)) {
    var submitButton = document.getElementById("login-submit");
    var googleButton = document.getElementsByClassName("login-btn btn-google")[0];
    var facebookButton1 = document.getElementsByClassName("login-btn btn-facebook")[0];
    var facebookButton2 = document.getElementsByClassName("login-btn btn-facebook")[1];
    // setting the required onclick
    submitButton.onclick = updateCF;
    googleButton.addEventListener("click", updateCF, false);
    facebookButton1.addEventListener("click", updateCF, false);
    facebookButton2.addEventListener("click", updateCF, false);
  }
  else if (!!document.body.className.match(homePage)) {
    // getting the required cookie after the user has logged in
    var key = getCookie("userkey");
    var userGuid = document.getElementById("userGuid");
    if (userGuid != null) {
      userGuid = userGuid.value;
      if (cf != false && key != null) {
        var data = cf["latestData"][key];
        if (cf["latestData"][userGuid] == null) {
          cf["latestData"][userGuid] = 1;
        }
        else {
          cf["latestData"][userGuid] += 1;
        }

        delete cf["latestData"][key];
        cf = JSON.stringify(cf);
        // making the custom field and storing in the values if login is succesful
        makeCustomField("logincount", "Implementations", true, code, null, cf);
      }
    }
    // deleting the newly made user key on login
    deleteCookie("userkey");
  }
}

/**
 * function used to make and save cookies inside the mobile browser
 * @param {String} name name of the cookie to be created 
 * @param {String} value value to be stored inside the cookie
 */
function makeCookie(name, value) {
  document.cookie = name + "=" + value + "; " + "path=/";
}

/**
 * used to delete the cookie with a particular namm
 * @param {String} name name of the cookie which is to be deleted
 */
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu Jan 01 1970 07:30:00 GMT+0730; path=/";
}

/**
 * used to retrieve the value of a particular cookie
 * @param {String} name name of the cookie whose value is to be extracted 
 * @returns {String} value stored inside the cookie
 */
function getCookie(name) {
  var cookies = document.cookie;
  cookies = cookies.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].split("=");
    if (cookie[0].trim() == name) {
      return cookie[1];
    }
  }
}

/**
 * generates and returns a random key
 * @returns {Number} value of the generated random key
 */
function makeRandomKey() {
  var randomKey = "";
  for (var i = 0; i < 100; i++) {
    randomKey += Math.round(Math.random() * 10);
  }
  return randomKey;
}

/**
 * function used to make the custom field and stored in the value if it exists
 * @param {String} name name of the custom field being used 
 * @param {String} table name of the referrence table being used to store data
 * @param {Boolean} exists indicates whether the custom field already  
 * @param {String} code code of the custom field being used
 * @param {String} id id of the user being sent to the PHP 
 * @param {String} value value which is going to be stored inside the custom field 
 */
function makeCustomField(name, table, exists, code, id, value) {

  var FinalResult;
  var url = packagePath + '/makecustomfields.php';
  var data = {
    "Name": name,
    "Table": table,
    "Exists": exists,
    "Code": code,
    "Value": value,
    "ID": id
  }

  /*Using ajax to send the data to PHP file.
  Synchronous ajax (async:false) is used here because the function needs
  to assign result to FinalResults before it returns FinalResult.*/

  $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    async: false,
    success: function (result) {
      // toastr.success('Task successfully completed', 'Great');
      /*PHP returns a json encoded string.
      Parse the string into a JSON object and assign it to Final Result.*/
      FinalResult = JSON.parse(result);
    },
    error: function (error) {
      toastr.error('Something went wrong', 'Error');
    }
  });

  return FinalResult;
}

$(document).ready(function () {
  userlogins();
});
