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
        console.log("entered if", "POST marketplace");
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
            console.log(response);
        });
        console.log("done");

    }

    else {

        // POST request to create a new custom field
        console.log("entered else", "POST custom field");
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
            "async": false,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + admintoken
            },
            "data": JSON.stringify(data)
        };

        $.ajax(settings2).done(function (response) {
            console.log(response);
            cf = response;
        });
        console.log("done");

        // POST request to update the custom field after creation
        console.log("POST marketplace");
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
            console.log(response);
        });
        console.log("done");
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



// function for testing the implemented functions
function testing() {
    // createCfImplementations(document.getElementById('tp').value, document.getElementById('tp1').value);
    a = {
        "2018": {
            "0": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            },
            "1": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            },
            "2": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            },
            "3": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            },
            "4": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            },
            "5": {
                "metric1": [],
                "metric2": [],
                "metric3": []
            }

        }
    }
    // createCfImplementationsJSON("testJson", a);
    // console.log(retrieveCfValueJSON("testJson"));
    storeUserDataMonthSpecific();
}