<?php

require('base.php')

?><!doctype html>
<html lang="de">
<head>
    <meta charset="utf-8"/>
    <title>Tech Rating <?= $app->project ? '- ' . $app->projectInfo['title'] : '' ?></title>
    <script src="/lib/jquery.js"></script>
    <script src="/lib/jquery-ui.min.js"></script>
    <script src="/lib/jquery.svg.js"></script>
    <script src="/lib/bootstrap.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
    <link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">
    <script>
        global_project = '<?=$_GET['project']?>';
        global_rigth_to_delete_ratingitems = '<?= $app->projectRights && $app->projectRights['can_write'] ?>';
    </script>
</head>
<body>

<?php require('header.php') ?>

<ul class="nav nav-tabs">
    <div id="category-menu-location"></div>
    <li><a href="javascript:itemPane.show()"><?= _('Vorschl&auml;ge') ?></a></li>
</ul>

<div id="content-root" class="tab-pane"></div>

<script src="/gui/restclient.js"></script>
<script src="/gui/vote.js"></script>
<script src="/gui/common.js"></script>
</body>
</html>
