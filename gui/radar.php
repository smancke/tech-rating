<?php 

require('base.php') 

?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Tech Rating <?=$app->project ? '- '.$app->projectInfo['title'] : '' ?></title>
<script>
     global_project = '<?=$app->project?>';
</script>
<script src="/lib/jquery.js"></script>
<script src="/gui/restclient.js"></script>
<script type="text/javascript" src="/lib/jquery.svg.js"></script>
<script src="/lib/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
<link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
<link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">
<script src="/gui/radar.js"></script>
<script src="/gui/common.js"></script>
</head>
<body>

<?php require('header.php') ?>

<div id="content-root" class="tab-pane" style="height: 100%;">  
  <div id="radar" style="width: 800px; height: 800px; padding: 0 auto; border: 0px solid #000000; float:left;"></div> 

  <div class="well" style="width: 300px; margin: 0px 0px 20px 30px; padding: 5px; float:left;">
    <a href="/gui/createRating.php"><span class="glyphicon glyphicon-arrow-right"></span> Eigenes Rating erstellen</a>
  </div>
  <div class="well" style="width: 300px; margin: 0px 0px 20px 30px; padding: 5px; float:left;">
<?php if (count($app->myProjects)>0) {?>
    <h4 style="margin-top: 2px;">Meine Ratings</h4>
    <div class="list-group">
    <?php foreach($app->myProjects as $project) { ?>
       <a class="list-group-item<?= ($app->project==$project['name']) ? ' active' : ''?>" href="/rating/<?=$project['name']?>"><?=$project['title']?></a>
    <?php } ?>
    </div>
<?php } ?>
    <h4 style="margin-top: 2px;">&Ouml;ffentliche Ratings</h4>
    <div class="list-group">
    <?php foreach($app->publicProjects as $project) {  ?>
       <a class="list-group-item<?= ($app->project==$project['name']) ? ' active' : ''?>" href="/rating/<?=$project['name']?>"><?=$project['title']?></a>
    <?php } ?>
    </div>

  </div>
<br>
<?php if ($app->showTimeline) { ?>
  <div id="timeline" class="well" style="width: 300px; height: 400px; margin: 0px 0px 20px 30px; padding: 5px; float:left;">
    <h4 style="margin-top: 2px;">Letzte Ereignisse</h4>
    <div id="timeline-content" style="overflow: auto; width: 290px; height: 350px; overflow-x: hidden;"/>
  </div>
<?php } ?>
</div>

</body>
</html>
