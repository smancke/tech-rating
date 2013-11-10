<?php

require 'base.php';

if (!$app->email) {
    Header('Location: ' . '/gui/loginRedirect.php?nextAction=/gui/createRating.php');
    die();
}

$errorMessage = '';

function isNameValid()
{
    global $_POST;
    return isset($_POST['name']) &&
    preg_match('/^[a-zA-Z0-9_-]+$/', $_POST['name']);
}

if (isset($_POST['name'])) {
    if (!isNameValid())
        $errorMessage = 'Name nicht g�ltig!';
    else if ($userMgr->getProjectInfo($_POST['name']))
        $errorMessage = 'Projektname bereits vergeben!';
    else if (!isset($_POST['title']) && !preg_match('/[a-zA-Z0-9_-]+/', $_POST['name']))
        $errorMessage = 'Projekttitel fehlt!';
    else {
        $userMgr->createProject($_POST['name'], $_POST['title'], $_POST['is_public_viewable']);
        Header('Location: /gui/manage.php?project=' . $_POST['name']);
        die();
    }
}

$name = isset($_POST['name']) ? $_POST['name'] : "";
$title = isset($_POST['title']) ? $_POST['title'] : "";

?><!DOCTYPE html>
<html>
<head>
    <title><?=_('Techrating anlegen')?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="/lib/jquery.js"></script>
    <script src="/lib/bootstrap.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/lib/jquery.svg.css">
    <link rel="stylesheet" type="text/css" href="/lib/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="/gui/tech-rating.css">
</head>
<body>
<?php include('header.php') ?>

<?php if ($errorMessage) {
    echo '<div class="alert alert-danger">' . $errorMessage . '</div>';
}?>
<br>

<div class="well" style="width: 400px; margin: auto">
    <h3><?=_('Techrating anlegen')?></h3>

    <form action="/gui/createRating.php" method="POST" role="form">
        <div class="form-group">
            <label for="name"><?=_('Name:')?></label>
            <input id="name" name="name" type="text" placeholder="<?=_('z.B. projektgruppe42')?>" class="form-control"
                   style="width: 300px;" value="<?= $name ?>">
        </div>
        <div class="form-group">
            <label for="title"><?=_('Titel:')?></label>
            <input id="name" name="title" type="text" placeholder="<?=_('z.B. Rating der Projektgruppe 42')?>"
                   class="form-control" style="width: 300px;" value="<?= $title ?>">
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" name="is_public_viewable"
                       value="1"<?= (isset($_POST['title']) && $_POST['is_public_viewable'] != 1) ? '' : ' checked' ?>>
                <?=_('&Ouml;ffentlich sichtbar')?>
            </label>
        </div>
        <div class="radio">
            <label>
                <input type="radio" name="is_public_voteable"
                       value="1"<?= !isset($_POST['is_public_voteable']) || (isset($_POST['is_public_voteable']) && $_POST['is_public_voteable'] == 1) ? ' checked' : '' ?>>
                <?=_('Alle angemeldeten Benutzer k&ouml;nnen abstimmen')?>
            </label>
        </div>
        <div class="radio">
            <label>
                <input type="radio" name="is_public_voteable"
                       value="0"<?= (isset($_POST['is_public_voteable']) && $_POST['is_public_voteable'] != 1) ? ' checked' : '' ?>>
                <?=_('Nur ausgew&auml;hlte Benutzer k&ouml;nnen abstimmen')?>
            </label>
        </div>
        <br/>
        <input type="submit" value="<?=_('Anlegen')?>" class="btn btn-default">
    </form>
</div>
</body>
</html>
