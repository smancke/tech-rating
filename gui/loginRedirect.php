<?php

require 'base.php';
require_once 'SimpleOAuthLogin/GoogleLoginProvider.php';
require_once 'SimpleOAuthLogin/LoginHandler.php';

$googleLogin = new GoogleLoginProvider((array)$cfg->google);
$loginHandler = new LoginHandler($googleLogin);

$loginHandler->redirectToAuthorisationServer();

?>