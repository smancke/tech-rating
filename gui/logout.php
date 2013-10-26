<?php

require 'base.php';

if (isset($_COOKIE['s'])) {
    $userMgr->invalidateSession($_COOKIE['s']);
}
Header('Location: /rating');

?>