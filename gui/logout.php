<?php

require 'base.php';
require_once 'SimpleOAuthLogin/LoginHandler.php';

$loginHandler = new LoginHandler(null);
$loginHandler->logout($userMgr);

Header('Location: /rating');

?>