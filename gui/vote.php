<?php 

require('base.php') 

?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Tech Rating - <?=$app->group?></title>
<script src="/lib/jquery.js"></script>
<script src="/lib/jquery-ui.min.js"></script>
<script type="text/javascript" src="/lib/jquery.svg.js"></script>
<script src="/lib/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
<link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
<link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">

<script>
     global_project = '<?=$_GET['project']?>';
</script>
<script src="/gui/restclient.js"></script>
<script src="/gui/vote.js"></script>
<script src="/gui/common.js"></script>
</head>
<body>

<?php require('header.php') ?>

    <ul class="nav nav-tabs">
     <div id="category-menu-location"></div>
     <li><a href="javascript:itemPane.show()">Vorschl&auml;ge</a></li>
    </ul>

     <div id="content-root" class="tab-pane"/>

</body>
</html>
