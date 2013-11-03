<?php

require 'base.php';

$errorMessage = '';

if (! $cfg->demo_login_enabled) {
    $errorMessage = 'Demo Login ist nicht aktiviert!';
} else {

    if (isset($_POST['demo_login_password'])) {
        
        if ($_POST['demo_login_password'] == $cfg->demo_login_password) {
            
            $userMgr->setAndCreateUserIfNotExists('demo', 'demo', 'demo', 'Demo User', '');
            $sessionId = $userMgr->startSession();
            setcookie('s', $sessionId, 0, '/');            
            
            Header('Location: /rating');
            die();
        } else {
            $errorMessage = 'Demo Passwort ist falsch';
        }
    }
}

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

    <br>
    <div class="well" style="width: 400px; margin: auto">
      <h3>Demo Login</h3>
<?php
if ($errorMessage) {
      echo '<div class="alert alert-danger">'.$errorMessage.'</div>';
}
?>

      <form action="" method="POST" role="form">
        <div class="form-group">
          <label for="name">Passwort</label>          
          <input name="demo_login_password" type="text" class="form-control" style="width: 300px;">
        </div>
        <br />
        <input type="submit" value="Login" class="btn btn-default">
      </form>
    </div>

  </body>
</html>
