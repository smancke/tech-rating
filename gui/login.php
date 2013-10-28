<?php

require 'base.php';
require_once 'SimpleOAuthLogin/SimpleGoogleLogin.php';

$googleLogin = new SimpleGoogleLogin((array)$cfg->google);

$errorMessage = '';

if (isset($_GET['code'])) {
    if ($googleLogin->exchangeAuthCode($_GET['code'])) {
        
        $userTokenInfo = $googleLogin->getTokenInfo();
        $me = $googleLogin->getMe();

        if (property_exists($userTokenInfo, 'email')) {         
            $userMgr->setAndCreateUserIfNotExists('google', $userTokenInfo->user_id, $userTokenInfo->email, $me->displayName, $me->image->url);
            
            // update my circle
            $mePeople = null;
            do {
                $mePeople = $googleLogin->getMePeople( $mePeople != null && property_exists($mePeople, 'nextPageToken') ? $mePeople->nextPageToken : null );
                //var_dump($mePeople);
                if ($mePeople && property_exists($mePeople, 'items')) {
                    $userMgr->updateMyContacts($mePeople->items);
                } else {
                    error_log('could not get me people for user: '.$userTokenInfo->email);
                }
            } while (property_exists($mePeople, 'nextPageToken'));

            
            //create session         
            $sessionId = $userMgr->startSession();
            setcookie('s', $sessionId, 0, '/');
            
            $myProjects = $userMgr->getMyProjects();
            
            if (count($myProjects) > 0) 
                Header('Location: /rating/'.$myProjects[0]['name']);
            else
                Header('Location: /rating');
            die();
        } else {
            // todo log login problems
            $errorMessage = '<h1>Error on google sign in.</h1>(Could not get user info)';
        }
    } else {
        // todo log login problems
        $errorMessage = '<h1>Error on google sign in.</h1>(Could not get access_token)';
    }
}

$login_uri = $googleLogin->getAuthUrl(true);

?><!DOCTYPE html>
<html>
  <head>
    <title>Tech Rating - login</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
<script src="/lib/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
<link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
<link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">
  </head>
  <body>
<?php include('header.php') ?>

<?php

if ($errorMessage) {
      echo '<div class="alert alert-danger">'.$errorMessage.'</div>';
}
?>

    <br>
    <div class="thumbnail center well text-center">
      <br>
      <br>
      <a href="<?=$login_uri?>"><img src="/gui/images/google-sign-in.png"></a>
      <br>
      <br>
    </div>

  </body>
</html>
