<?php

require 'base.php';
require_once 'SimpleOAuthLogin/SimpleGoogleLogin.php';

$googleLogin = new SimpleGoogleLogin((array)$cfg->google);

$loginInfo = ['state' => md5(rand())];
if (isset($_GET['nextAction'])) {
    $loginInfo['nextAction'] = $_GET['nextAction'];
}

setcookie('l', json_encode($loginInfo), 0, '/');

$authUrl = $googleLogin->getAuthUrl($loginInfo['state'], true);
Header('Location: '. $authUrl);

?>