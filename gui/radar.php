<?php 

require('base.php') 

?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?=_('Tech Rating ')?><?=$app->project ? '- '.$app->projectInfo['title'] : '' ?></title>
<script src="/lib/jquery.js"></script>
<script src="/lib/jquery-ui.min.js"></script>
<script type="text/javascript" src="/lib/jquery.svg.js"></script>
<script src="/lib/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
<link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
<link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">

<script>
     global_project = '<?=$app->project?>';
</script>
<script src="/gui/restclient.js"></script>
<script src="/gui/radar.js"></script>
<script src="/gui/common.js"></script>
</head>
<body>

<?php require('header.php') ?>

<div id="content-root" class="tab-pane" style="height: 100%;">  
  <div id="radar" style="width: 800px; height: 800px; padding: 0; border: 0 solid #000000; float:left;"></div>

  <div class="well" style="width: 300px; margin: 0 0 20px 30px; padding: 5px; float:left;">
    <a href="/gui/createRating.php"><span class="glyphicon glyphicon-arrow-right"></span> <?=_('Eigenes Rating erstellen')?></a>
  </div>
  <div class="well" style="width: 300px; margin: 0 0 20px 30px; padding: 5px; float:left;">
<?php if (count($app->myProjects)>0) {?>
    <h4 style="margin-top: 2px;"><?=_('Meine Ratings')?></h4>
    <div class="list-group">
    <?php foreach($app->myProjects as $project) { ?>
       <a class="list-group-item<?= ($app->project==$project['name']) ? ' active' : ''?>" href="/rating/<?=$project['name']?>"><?=$project['title']?></a>
    <?php } ?>
    </div>
<?php } ?>
    <h4 style="margin-top: 2px;"><?=_('&Ouml;ffentliche Ratings')?></h4>
    <div class="list-group">
    <?php foreach($app->publicProjects as $project) {  ?>
       <a class="list-group-item<?= ($app->project==$project['name']) ? ' active' : ''?>" href="/rating/<?=$project['name']?>"><?=$project['title']?></a>
    <?php } ?>
    </div>

  </div>
<br>
<?php if ($app->showTimeline) { ?>
  <div id="timeline" class="well" style="width: 300px; height: 400px; margin: 0 0 20px 30px; padding: 5px; float:left;">
    <h4 style="margin-top: 2px;"><?=_('Letzte Ereignisse')?></h4>
    <div id="timeline-content" style="overflow: auto; width: 290px; height: 350px; overflow-x: hidden;"></div>
  </div>
<?php } ?>
</div>

</body>
</html>
