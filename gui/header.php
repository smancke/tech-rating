<div class="navbar-inverse">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/rating">Techrating<?php 
if ($app->project) { 
     echo ': <strong>'.$app->projectInfo['title'].'</strong>';
}
?></a>
    </div>
    <div class="collapse navbar-collapse">

<?php if ($app->projectRights['can_write'] || ($app->email && $app->projectInfo['is_public_voteable']))  { ?>
     <ul class="nav navbar-nav">
       <li><a href="/gui/vote.php?project=<?=$app->project?>"><span class="glyphicon glyphicon-play"></span> abstimmen</a></li>
       <li><a href="/rating/<?=$app->project?>"><span class="glyphicon glyphicon-eye-open"></span> radar</a></li>
       <?php if ($app->projectRights['is_owner']) { ?>
         <li><a href="/gui/manage.php?project=<?=$app->project?>"><span class="glyphicon glyphicon-user"></span> benutzer verwalten</a></li>
       <?php } ?>

     </ul>
<?php } ?>

<?php if (! $app->email) { ?>
      <div class="navbar-right">
          <a href="/gui/loginRedirect.php"><img style="margin-top: 4px;" src="/gui/images/google-sign-in.png"/></a>';
      </div>
<?php } ?>

      <div class="navbar-right">
        <ul class="nav navbar-nav">
<?php if ($app->email) { ?>
          <li class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">&ouml;ffentliche ratings <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <?php foreach($app->publicProjects as $project) { ?>
                 <li><a href="/rating/<?=$project['name']?>"><?=$project['title']?></a></li>
              <?php } ?>
            </ul>
          </li>          
          <li class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">meine ratings <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <?php foreach($app->myProjects as $project) { ?>
                 <li><a href="/rating/<?=$project['name']?>"><?=$project['title']?></a></li>
              <?php } ?>
            </ul>
          </li>          

          <li class="dropdown">
            <a style="padding: 0px;" class="dropdown-toggle" data-toggle="dropdown" href="#">
<?php if ($app->userInfo['image_url']): ?>
  <img style="padding:0px; margin:0px; height:40px; width:40px;" src="<?=$app->userInfo['image_url']?>" title="<?=$app->userInfo['displayname']?>"> 
<?php else: ?>
  <span style="padding:10px;" class="glyphicon glyphicon-user" title="<?=$app->userInfo['displayname']?>"></span>
<?php endif ?>
            <span class="caret"></span></a>
            <ul class="dropdown-menu">
              <li><a href="/gui/createRating.php"><span class="glyphicon glyphicon-star"></span> techrating anlegen</a></li>
              <li><a href="/gui/logout.php"><span class="glyphicon glyphicon-ban-circle"></span> Logout</a></li>
            </ul>
          </li>          
<?php } ?>

        </ul>
      </div>
    </div>
</div>
