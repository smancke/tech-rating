<?php

require 'base.php';
require_once 'SimpleOAuthLogin/GoogleLoginProvider.php';
require_once 'SimpleOAuthLogin/LoginHandler.php';

$googleLogin = new GoogleLoginProvider((array)$cfg->google);
$loginHandler = new LoginHandler($googleLogin);

if (isset($_GET['code']) 
    && $loginHandler->login()
    && $loginHandler->ensureUserAndStartSession($userMgr)
    && $loginHandler->updateMyCircles($userMgr)
    ) {

    Header('Location: '.$loginHandler->getNextAction('/rating'));
    die();
} else {
    $errorMessage = $loginHandler->getError();
}


?><!DOCTYPE html>
<html>
  <head>
    <title><?=_('Tech Rating - Login')?></title>

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
      <a href="/gui/loginRedirect.php"><img src="/gui/images/google-sign-in.png"></a>
      <br>
      <br>
    </div>

  </body>
</html>
