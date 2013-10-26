<?php

require 'base.php';

if (!$app->projectRights['is_owner']) {
    Header('HTTP/1.0 401 Unauthorized');
    echo 'Not allowd!';
    exit;
}

if (isset($_POST['rights'])) {
   $userMgr->setProjectRights($app->projectInfo['id'], $_POST['rights']);
}

$contactRights = $userMgr->getMyContactsRights($app->projectInfo['id']);

//var_dump($_POST);

?><!DOCTYPE html>
<html>
  <head>
    <title>Techrating anlegen</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
<script src="/lib/jquery.js"></script>
<script src="/lib/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
<link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
<link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">
  </head>
  <body>
<?php include('header.php') ?>

    <br>
    <div class="well" style="width: 800px; margin: auto">
      <h3>Berechtigungen verwalten: <?=$app->projectInfo['title']?></h3>
      <form action="/gui/manage.php" method="POST" role="form">
        <input type="hidden" name="project" value="<?=$app->project?>">
        <input type="submit" value="Speichern" class="btn btn-default">
        <table class="table table-hover">
          <thead>
            <tr>
              <td align="center">ansehen <br><a href="#">alle</a></td>
              <td align="center">bewerten <br><a href="#">alle</a></td>
              <td align="center">verwalten</td>
              <td></td>
              <td></td>
            </tr>
          </thead>
          <tbody>
<?php foreach ($contactRights as $contact) { ?>
          <tr>
            <td align="center"><input type="checkbox" name="rights[<?=$contact['id']?>][]" value="can_read"<?=($contact['project_id']) ? ' checked' : ''?>></td>
            <td align="center"><input type="checkbox" name="rights[<?=$contact['id']?>][]" value="can_write"<?=($contact['can_write']) ? ' checked' : ''?>></td>
            <td align="center"><input type="checkbox" name="rights[<?=$contact['id']?>][]" value="is_owner"<?=($contact['is_owner']) ? ' checked' : ''?>></td>
            <td><img width="40" height="40" src="<?=$contact['image_url']?>"></td>
            <td><strong><?=$contact['displayname']?></strong></td>
          </tr>
<?php } ?>
          <tbody>
        </table>
        <input type="submit" value="Speichern" class="btn btn-default">
      </form>
    </div>
      <br>
      <br>

  </body>
</html>
