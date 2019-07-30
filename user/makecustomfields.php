<?php
include 'callAPI.php';
include 'admin_token.php';

$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);

//Retrieve the data sent by the js code

$gender = $content['Gender'];
$UserId = $content['userId'];
$customFieldExists = $content['customFieldExists'];
$code = $content['Code'];


$admin_token = getAdminToken();
$baseUrl = getMarketplaceBaseUrl();

//If custom field already exists then just update the existing custom field

if($customFieldExists){
  $data = [
    'ID'=>$UserId,
    'CustomFields'=>[
      [
        'Code'=>$code,
        'Values'=>[
          $gender
        ]
      ]
    ]
  ];

  $url = $baseUrl.'/api/v2/users/'.$UserId;
  $response = callAPI("PUT",$admin_token['access_token'],$url,$data);
  // header("Location: index.php?response=$response");

}

//Otherwise make a new custom field and update that custom field

else{

  $cf_data = [
    'Name'=>'gender',
    'IsMandatory'=>false,
    'DataInputType'=>'textfield',
    'ReferenceTable'=>'Users',
    'DataFieldType'=>'string',
    'IsSearchable'=>true,
    'IsSensitive'=>false,
    'Active'=>true
  ];

  $url = $baseUrl.'/api/v2/admins/'.$admin_token['UserId'].'/custom-field-definitions';
  $response = callAPI("POST",$admin_token['access_token'],$url,$cf_data);


  $data = [
    'ID'=>$UserId,
    'CustomFields'=>[
      [
        'Code'=>$response['Code'],
        'Values'=>[
          $gender
        ]
      ]
    ]
  ];

  $url = $baseUrl.'/api/v2/users/'.$UserId;
  $response2 = callAPI("PUT",$admin_token['access_token'],$url,$data);

}

?>