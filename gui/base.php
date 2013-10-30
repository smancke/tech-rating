<?php
date_default_timezone_set("Europe/Berlin");
require_once '../config.php';
require 'dbFacile/dbFacile_mysql.php';
require 'SimpleOAuthLogin/UserManager.php';

class App {
    public $project = '';
    public $projectInfo = '';
    public $projectRights = '';
    public $email = '';
    public $userInfo = '';
    public $showTimeline = true;
    public $publicProjects = '';
    public $myProjects = '';
}
$app = new App();

$db = new dbFacile_mysql();
$db->open($cfg->db_name, $cfg->db_user, $cfg->db_password, $cfg->db_host);
if ($cfg->db_logfile)
    $db->setLogile($cfg->db_logfile);
$userMgr = new UserManager($db);

if (isset($_COOKIE['s'])) {
    if ($userMgr->pickUpSession($_COOKIE['s'])) {
        $app->userInfo = $userMgr->getUserInfo();
        $app->email = $app->userInfo['email'];
    }
}

$app->project = isset($_GET['project']) && $_GET['project'] ? $_GET['project'] : 'default';
if (isset($_POST['project']) && $_POST['project']) 
    $app->project = $_POST['project'];
if ($app->project) {
    $app->projectInfo = $userMgr->getProjectInfo($app->project);
    $app->projectRights = $userMgr->getMyProjectRights($app->projectInfo['id']);
}

$app->publicProjects = $userMgr->getPublicProjects();
$app->myProjects = $userMgr->getMyProjects();

function cfg_basepath() {
    global $cfg;
    return $cfg['basepath'];
}

?>