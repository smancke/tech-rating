<?php

/**
 * Litle abstraction for managing users, sessions and projects
 */;
class UserManager {

    private $db;

    private $userId;

    private $sessionExpirationTime;

    public function __construct($db, $sessionExpirationTime=1800) {
        $this->db = $db;
        $this->sessionExpirationTime = $sessionExpirationTime;
    }
    
    /**
     * set the user/owner for all queries
     * If it does not exist, we create it within the database.
     */
    public function setAndCreateUserIfNotExists($origin, $externalId, $email='', $displayName='', $imageUrl='') {
        
        $result = $this->db->fetchRow("SELECT * FROM user WHERE origin = ? AND external_id = ?", [$origin, $externalId]);
        if ($result) {
            
            $this->userId = $result['id'];
            $this->db->update(['last_login' => date('Y-m-d H:i:s',time())], 
                              'user', 
                              ['id' => $this->userId]);


        } else {

            $insData = ['external_id' =>  $externalId, 
                        'email' => $email,
                        'displayname' => $displayName,
                        'image_url' => $imageUrl,
                        'origin' => $origin, 
                        'last_login' => date('Y-m-d H:i:s',time()),
                        'created' => date('Y-m-d H:i:s',time())];
            $this->userId = $this->db->insert( $insData, 'user' );

            if (!$this->userId) {
                throw new Exception('error on creating user: '. $this->db->error());
            }
        }


    }

    /**
     * Returns the information of a user
     */
    public function getUserInfo() {
        return $this->db->fetchRow("SELECT * FROM user WHERE id = ?", [$this->userId]);
    }

    /**
     * starts a session fot the userid
     * and returns the session id
     */
    public function startSession() {
        $id = sprintf ( "%06x%06x%06x%06x%06x%06x", 
                        mt_rand (0, 0xffffff), mt_rand (0, 0xffffff), mt_rand (0, 0xffffff),
                        mt_rand (0, 0xffffff), mt_rand (0, 0xffffff), mt_rand (0, 0xffffff));

        $insData = ['sessionid' =>  $id, 
                    'created' => date('Y-m-d H:i:s',time()), 
                    'expiration' => date('Y-m-d H:i:s', time() + $this->sessionExpirationTime),
                    'user_id' => $this->userId];

        if ($this->db->insert( $insData, 'session' )) {
            return $id;
        } else {
            throw new Exception('error on starting sesstion: '. $this->db->error());
        }
    }

    /**
     * Checks, if a session is valid and 
     * updates the expiration date of the session.
     * Also, the userId will be set to the user of the session.
     * If the session was valid, the will be returned, false otherwise.     
     */
    public function pickUpSession($sessionid) {
        $session = $this->db->fetchRow("SELECT * FROM session WHERE sessionid = ? AND expiration > ?", [$sessionid, date('Y-m-d H:i:s',time())]);
        if ($session) {

            $this->userId = $session['user_id'];
            $this->db->update(['expiration' => date('Y-m-d H:i:s', time() + $this->sessionExpirationTime)],
                              'session',
                              ['sessionid' => $sessionid]);
            return true;
        } else {
            
            return false;

        }
    }

    /**
     * Invalidates a session 
     */
    public function invalidateSession($sessionid) {
        $this->db->update(['expiration' => date('Y-m-d H:i:s', 0)],
                          'session',
                          ['sessionid' => $sessionid]);
    }


    /**
     * Creates a new Project with the user as owner
     */
    public function createProject($name, $title, $publicViewable) {
        $insData = ['name' =>  $name,
                    'title' => $title,
                    'is_public_viewable' => $publicViewable,
                    'created' => date('Y-m-d H:i:s',time())];
        $projectId = $this->db->insert( $insData, 'project' );

        if (!$projectId)
            return false;

        $insData = ['user_id' =>  $this->userId,
                    'project_id' => $projectId,
                    'can_write' => true,
                    'is_owner' => true];
        $this->db->insert( $insData, 'user_project' );
        
        return $projectId;
    }


    /**
     * Returns the information of a user
     */
    public function getProjectInfo($name) {
        return $this->db->fetchRow("SELECT * FROM project WHERE name = ?", [$name]);
    }

    /**
     * Returns the information of a user
     */
    public function getMyProjectRights($projectId) {
        return $this->db->fetchRow("SELECT * FROM user_project WHERE user_id = ? AND project_id = ?", [$this->userId, $projectId]);
    }


    /**
     * Iterates over the supplied contact list and 
     * inserts every user into the users table and connects them as 'known'.
     */
    public function updateMyContacts($googlePersonItemList) {
        foreach ($googlePersonItemList as $item) {
            $this->updateMyContact($item);
        }
    }

    protected function updateMyContact($googlePersonItem) {
        $id = $this->db->fetchCell("SELECT id FROM user WHERE origin = 'google' AND external_id = ?", [$googlePersonItem->id]);
        if (!$id) {
            $insData = ['displayname' => $googlePersonItem->displayName,
                        'origin' => 'google',
                        'external_id' =>  $googlePersonItem->id,
                        'image_url' =>  $googlePersonItem->image->url,
                        'created' => date('Y-m-d H:i:s',time())];
            $id = $this->db->insert( $insData, 'user' );
            if (!$id)
                return false;
        }
        
        $friendship = $this->db->fetchRow("SELECT * FROM user_user WHERE self_id = ? AND friend_id = ?", [$this->userId, $id]);
        if (!$friendship) {
            $insData = ['self_id' => $this->userId,
                        'friend_id' => $id,
                        'created' => date('Y-m-d H:i:s',time())];
            $this->db->insert( $insData, 'user_user' );
        }
        return $id;        
    }

    public function getPublicProjects() {        
        return $this->db->fetchRows("SELECT * FROM project WHERE is_public_viewable = '1'");
    }

    public function getMyProjects() {        
        return $this->db->fetchRows("SELECT * FROM project WHERE id IN (SELECT project_id FROM user_project WHERE user_id = ?)", [$this->userId]);
    }


    public function getMyContactsRights($projectId) {
        $sql = <<<EOT
            SELECT * FROM user
            LEFT OUTER JOIN user_project ON user.id = user_project.user_id AND user_project.project_id = ?
            WHERE 
            user.id IN (SELECT friend_id FROM user_user WHERE self_id = ?)
            OR
            user.id IN (SELECT user_id FROM user_project WHERE project_id = ?)
            AND NOT user.id = ?
            ORDER BY is_owner DESC, can_write DESC, displayname ASC
EOT;
        return $this->db->fetchRows($sql, [$projectId, $this->userId, $projectId, $this->userId]);
    }

    public function setProjectRights($projectId, $rightsList) {        
        $this->db->execute('DELETE FROM user_project WHERE project_id = ? AND NOT user_id = ?', [$projectId, $this->userId]);
        foreach($rightsList as $userID => $userRight) {
            $insData = ['user_id' => $userID,
                        'project_id' => $projectId,
                        'can_write' => in_array('can_write', $userRight),
                        'is_owner' => in_array('is_owner', $userRight),
                        'created' => date('Y-m-d H:i:s',time())];
            $id = $this->db->insert( $insData, 'user_project' );            
        }
    }
    
}
?>